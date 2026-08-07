let sequence = 0;

export function nextHistorySequence(): number {
	sequence += 1;
	return sequence;
}
