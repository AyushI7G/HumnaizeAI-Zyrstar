"""
Shared, dependency-light NLP utilities used by both the Detection Engine
and the Humanizer. Everything here runs on CPU with no GPU requirement,
using nltk (punkt tokenizer only, ~13MB) + wordfreq (pure-python, no model
downloads) so the service stays lightweight enough for Render's free/
starter instances.
"""

import re
from functools import lru_cache

import nltk
from wordfreq import zipf_frequency

_NLTK_RESOURCES = [
    "punkt",
    "punkt_tab",
    "averaged_perceptron_tagger",
    "averaged_perceptron_tagger_eng",
]


def ensure_nltk_data() -> None:
    for resource in _NLTK_RESOURCES:
        found = False

        for path in (
            f"tokenizers/{resource}",
            f"taggers/{resource}",
        ):
            try:
                nltk.data.find(path)
                found = True
                break
            except Exception:
                pass

        if not found:
            try:
                nltk.download(resource, quiet=True, raise_on_error=False)
            except Exception:
                pass


ensure_nltk_data()

SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])")
WORD_RE = re.compile(r"[A-Za-z']+")


def split_sentences(text: str) -> list[str]:
    try:
        from nltk.tokenize import sent_tokenize

        sentences = sent_tokenize(text)
    except Exception:
        sentences = SENTENCE_SPLIT_RE.split(text)

    return [s.strip() for s in sentences if s.strip()]


def tokenize_words(text: str) -> list[str]:
    return WORD_RE.findall(text)


@lru_cache(maxsize=20000)
def word_zipf(word: str) -> float:
    """Zipf frequency: how common a word is in general English (0 rare - 8 very common)."""
    return zipf_frequency(word.lower(), "en")


def count_syllables(word: str) -> int:
    word = word.lower()
    vowels = "aeiouy"
    count = 0
    prev_was_vowel = False

    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_was_vowel:
            count += 1
        prev_was_vowel = is_vowel

    if word.endswith("e") and count > 1:
        count -= 1

    return max(count, 1)


COMMON_AI_TRANSITIONS = {
    "furthermore", "moreover", "additionally", "in conclusion", "in summary",
    "overall", "it is important to note", "it is worth noting", "in today's world",
    "in the realm of", "delve into", "delve", "tapestry", "testament to",
    "plays a crucial role", "plays a vital role", "in essence", "underscores",
    "in the context of", "navigate", "landscape", "multifaceted", "holistic",
    "robust", "seamless", "leverage", "paradigm", "myriad", "boasts", "embark",
    "unlock the potential", "unleash", "harness the power", "in a nutshell",
    "when it comes to", "at the end of the day", "cutting-edge", "game-changer",
}


def contains_ai_boilerplate(text: str) -> list[str]:
    lowered = text.lower()
    return [phrase for phrase in COMMON_AI_TRANSITIONS if phrase in lowered]
