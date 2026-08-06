---
title: Open Source LLMs
tags:
  - ai
  - generated
  - llm
group: ai-technology-digital-culture
description: Open source LLM models are large language models that are freely available for anyone to use, modify, and distribute. They are based on transformers, a type of neural network architecture that can process natural language at scale.
date: 2023-12-17
supergroup: knowledge
---
For this post I asked Bing and Claude to explain open source LLMs to me.

## Bing

Open source LLM models are large language models that are freely available for anyone to use, modify, and distribute. They are based on transformers, a type of neural network architecture that can process natural language at scale. Open source LLM models have many benefits, such as enhanced data security, cost savings, reduced vendor dependency, and increased transparency and innovation.

There are many open source LLM models that have been developed by different organizations and communities. Some of the most popular ones are:

- **LLaMA**: A multilingual LLM that can handle 100 languages and supports zero-shot cross-lingual transfer learning.
- **BLOOM**: A 176B-parameter LLM that is trained on web data from 275 languages and can generate text in any language.
- **BERT**: A bidirectional LLM that can learn from both left and right context and achieve state-of-the-art results on various natural language understanding tasks.
- **GPT-J-6B**: A 6B-parameter LLM that is a JAX-based implementation of GPT-3 and can generate coherent and diverse text.
- **MPT-30B**: A 30B-parameter LLM that is trained on a large and diverse corpus of text and can perform multiple tasks, such as summarization, translation, and question answering.
- **Dolly**: A 12B-parameter LLM that is tuned for natural language instruction and can execute commands in various domains, such as math, logic, and programming.
- **Pythia**: A suite of LLMs that can analyze the behavior and performance of other LLMs across training and scaling.
- **Falcon**: A family of LLMs that are trained on refined web data and can generate high-quality text in multiple languages.
- **FastChat-T5**: A compact and commercial-friendly chatbot that is based on T5, a text-to-text LLM that can handle any natural language task.
- **h2oGPT**: A LLM that can run on any device and can generate text for various purposes, such as storytelling, summarization, and dialogue.
- **RedPajama-INCITE**: A family of LLMs that are optimized for conversational AI and can generate engaging and informative responses.

If you want to learn more about these open source LLM models, you can check out their websites, papers, blogs, or GitHub repositories using the links provided. You can also try them out using online platforms, such as Hugging Face or Gradio. I hope this guide was helpful for you. 😊

## Claude
### Introduction to LLMs
Large language models (LLMs) are a class of artificial intelligence systems that are trained on huge volumes of text data in order to develop an intricate understanding of human language. They employ machine learning and natural language processing techniques in order to generate, comprehend, summarize and translate language. LLMs today are at the cutting edge of natural language AI research.

### Parameters
Parameters are the fundamental unit that power the capabilities of LLMs. They refer to the adjustable variables or weights in the machine learning model that allow it to map input language to desired output. During training, these parameters are tuned in order to minimize the loss/error in the model’s linguistic predictions and understanding. More parameters enable the storage and modeling of more complex relationships and representations. The size of LLMs is commonly denoted in the number of parameters, for example, one with 1.5 billion is referred to as a 1.5B parameter model.

### Training Data
LLMs are trained using a technique called self supervised learning on massive datasets, usually consisting of 100s of GBs to 1000s of TBs of text content from diverse sources like books, Wikipedia, web pages, academic journals and news publications. This raw text acts as the learning signal that helps these models build associations and insights at different linguistic levels - from words, phrases, sentences to paragraphs, dialogue to entire stories or articles. The quality, size and diversity of the dataset is key for developing capable language understanding.

### Architectures
LLMs employ special neural network architectures designed for natural language. The most prominent among them is the Transformer architecture. It uses mechanisms called attention layers that model relationships between all words and phrases in text, thereby learning contextual representations. Transformers outperformed older architectures like recurrent neural networks (RNN) and long-short term memory (LSTM) networks in language tasks. Other popular architectures include BERT, GPT, BART and T5. State-of-the-art LLMs iteratively build upon each other - tools, ideas and performance from one fueling progress in the next.

### Types of LLMs
There are broadly three categories of LLMs based on their purpose - causal or auto-regressive LLMs (Like GPT series), masked language models (like BERT, RoBERTa) and encoder-decoder models (like BART, T5). Auto-regressive models generate tokens one by one and are best suited for language generation. Masked models bidirectionally model context and are designed for language understanding tasks. Encoder-decoder models can perform a variety of translation, summarization and question-answering tasks.

### Major Open Source LLMs
GPT-2: One of the first very large open source LLMs with 1.5 billion parameters. Launched by OpenAI in 2019, it showed strong performance and output quality across a variety of natural language generation tasks. BERT: Released by Google in 2018, it utilizes bidirectional training of Transformer. With 340 million parameters, it achieved state-of-the-art results in 11 NLP tasks including question answering, sentiment analysis. GPT-3: With 175 billion parameters, this massive commercial model trained by OpenAI significantly pushed boundaries of LLMs, showing ability to few-shot learn and zero-shot transfer across tasks. Jurassic-1: A 7 billion parameter model focused on safety, interpretability and reliability of large language models. It employs the Javascript-based JAX framework. OPT: At 175 billion parameters, OPT (Generable's Open Pre-Trained Transformer) is the largest open-source English LLM as of 2022. Its goal is to model diverse human language and knowledge in a single model.

I hope this detailed overview helps explain the key concepts and leading models in the exciting open source LLM landscape! 