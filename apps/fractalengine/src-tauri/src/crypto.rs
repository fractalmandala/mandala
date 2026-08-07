// Shared AES-256-GCM envelope encryption: a small per-purpose key lives in the OS
// keychain (fits everywhere, unlike large blobs — Windows Credential Manager caps a
// credential at 2560 bytes), and it's used to encrypt/decrypt whatever bulk data a
// caller hands in. Originally built for the password vault (lib.rs); memory.rs reuses
// it for chat message content with its own, separate keychain account.

const KEYCHAIN_SERVICE: &str = "com.fractalmandala.fractalengine";
const ENVELOPE_PREFIX: &str = "enc:v1:";

/// Fetches the named key from the keychain, generating and storing a fresh one on
/// first use. Each `account` gets its own independent key — compromising one purpose's
/// key (e.g. chat memory) doesn't expose another (e.g. the password vault).
pub fn get_or_create_key(account: &str) -> Result<[u8; 32], String> {
    use aes_gcm::aead::{rand_core::RngCore, OsRng};
    use base64::{engine::general_purpose::STANDARD as B64, Engine as _};

    let entry = keyring::Entry::new(KEYCHAIN_SERVICE, account).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(existing) => {
            let bytes = B64.decode(existing).map_err(|e| e.to_string())?;
            bytes
                .try_into()
                .map_err(|_| format!("Corrupt key in keychain for account '{}'", account))
        }
        Err(keyring::Error::NoEntry) => {
            let mut key = [0u8; 32];
            OsRng.fill_bytes(&mut key);
            entry
                .set_password(&B64.encode(key))
                .map_err(|e| e.to_string())?;
            Ok(key)
        }
        Err(e) => Err(e.to_string()),
    }
}

pub fn encrypt_with_key(plaintext: &str, key: &[u8; 32]) -> Result<String, String> {
    use aes_gcm::aead::{rand_core::RngCore, Aead, KeyInit, OsRng};
    use aes_gcm::{Aes256Gcm, Key, Nonce};
    use base64::{engine::general_purpose::STANDARD as B64, Engine as _};

    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| e.to_string())?;
    Ok(format!(
        "{}{}:{}",
        ENVELOPE_PREFIX,
        B64.encode(nonce_bytes),
        B64.encode(ciphertext)
    ))
}

/// Returns true when `encoded` has the structural shape of either the current
/// `enc:v1:<nonce>:<ciphertext>` envelope or the legacy `<nonce>:<ciphertext>`
/// envelope. Authentication is deliberately not part of this classification:
/// ciphertext written under a missing or rotated key must never be mistaken for
/// plaintext and encrypted again.
pub fn is_encrypted_envelope(encoded: &str) -> bool {
    use base64::{engine::general_purpose::STANDARD as B64, Engine as _};

    let payload = encoded.strip_prefix(ENVELOPE_PREFIX).unwrap_or(encoded);
    let Some((nonce_b64, ciphertext_b64)) = payload.split_once(':') else {
        return false;
    };
    if ciphertext_b64.contains(':') {
        return false;
    }
    let Ok(nonce) = B64.decode(nonce_b64) else {
        return false;
    };
    let Ok(ciphertext) = B64.decode(ciphertext_b64) else {
        return false;
    };
    nonce.len() == 12 && ciphertext.len() >= 16
}

pub fn decrypt_with_key(encoded: &str, key: &[u8; 32]) -> Result<String, String> {
    use aes_gcm::aead::{Aead, KeyInit};
    use aes_gcm::{Aes256Gcm, Key, Nonce};
    use base64::{engine::general_purpose::STANDARD as B64, Engine as _};

    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let payload = encoded.strip_prefix(ENVELOPE_PREFIX).unwrap_or(encoded);
    let (nonce_b64, ct_b64) = payload.split_once(':').ok_or("Malformed ciphertext")?;
    let nonce_bytes = B64.decode(nonce_b64).map_err(|e| e.to_string())?;
    let ciphertext = B64.decode(ct_b64).map_err(|e| e.to_string())?;
    if nonce_bytes.len() != 12 || ciphertext.len() < 16 {
        return Err("Malformed ciphertext envelope".to_string());
    }
    let nonce = Nonce::from_slice(&nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_slice())
        .map_err(|e| e.to_string())?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_plaintext() {
        let key = [7u8; 32];
        let encrypted = encrypt_with_key("hello, secret world", &key).unwrap();
        assert!(encrypted.starts_with(ENVELOPE_PREFIX));
        assert!(is_encrypted_envelope(&encrypted));
        assert_eq!(
            decrypt_with_key(&encrypted, &key).unwrap(),
            "hello, secret world"
        );
    }

    #[test]
    fn different_calls_use_different_nonces() {
        let key = [7u8; 32];
        let a = encrypt_with_key("same input", &key).unwrap();
        let b = encrypt_with_key("same input", &key).unwrap();
        assert_ne!(
            a, b,
            "ciphertext should differ across calls due to a random nonce"
        );
    }

    #[test]
    fn wrong_key_fails_to_decrypt() {
        let key_a = [1u8; 32];
        let key_b = [2u8; 32];
        let encrypted = encrypt_with_key("secret", &key_a).unwrap();
        assert!(is_encrypted_envelope(&encrypted));
        assert!(decrypt_with_key(&encrypted, &key_b).is_err());
    }

    #[test]
    fn recognizes_legacy_envelopes_without_authenticating_them() {
        let key = [7u8; 32];
        let encrypted = encrypt_with_key("legacy", &key).unwrap();
        let legacy = encrypted.strip_prefix(ENVELOPE_PREFIX).unwrap();
        assert!(is_encrypted_envelope(legacy));
        assert_eq!(decrypt_with_key(legacy, &key).unwrap(), "legacy");
    }

    #[test]
    fn malformed_ciphertext_is_rejected() {
        let key = [7u8; 32];
        assert!(!is_encrypted_envelope("not-valid-ciphertext"));
        assert!(decrypt_with_key("not-valid-ciphertext", &key).is_err());
        assert!(decrypt_with_key("YQ==:Yg==", &key).is_err());
    }
}
