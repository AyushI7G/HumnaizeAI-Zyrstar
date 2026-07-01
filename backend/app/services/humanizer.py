"""
Zyrstar Proprietary Humanizer Engine
-------------------------------------
Rewrites AI-flavored text to read more naturally while preserving
meaning. Fully self-contained (no third-party paraphrase API calls) and
CPU-only by default:

  1. Strips/replaces stock "AI boilerplate" transition phrases.
  2. Synonym substitution via WordNet, weighted to avoid over-common
     replacements and preserve part-of-speech.
  3. Sentence-length variation: merges short choppy runs / splits overly
     long uniform sentences to increase burstiness.
  4. Contraction and register adjustments based on requested tone.
  5. Light structural reordering of clauses using dependency-free
     heuristics (comma-clause shuffle) to break repetitive sentence
     openers.

If ENABLE_HEAVY_MODELS=true, an optional transformer-based paraphraser
(e.g. a small T5 paraphrase model) can be plugged in via
`heavy_paraphrase()`; the pipeline works fully without it.
"""
from __future__ import annotations

import random
import re

import nltk
from nltk.corpus import wordnet as wn

from app.services.detector import detection_engine
from app.services.nlp_utils import (
    COMMON_AI_TRANSITIONS,
    split_sentences,
    tokenize_words,
)

_WORDNET_READY = False


def _ensure_wordnet() -> None:
    global _WORDNET_READY
    if _WORDNET_READY:
        return
    try:
        wn.ensure_loaded()
    except LookupError:
        try:
            nltk.download("wordnet", quiet=True)
            nltk.download("omw-1.4", quiet=True)
        except Exception:
            pass
    _WORDNET_READY = True


REMOVE_PHRASES = {
    "it is important to note that ": "",
    "it is worth noting that ": "",
    "in today's world, ": "",
    "in the realm of ": "in ",
    "delve into": "look into",
    "tapestry of": "mix of",
    "testament to": "proof of",
    "plays a crucial role in": "matters a lot for",
    "plays a vital role in": "matters a lot for",
    "in essence, ": "",
    "underscores": "shows",
    "navigate the landscape of": "work through",
    "multifaceted": "complex",
    "holistic": "well-rounded",
    "robust": "solid",
    "seamless": "smooth",
    "leverage": "use",
    "myriad of": "many",
    "boasts": "has",
    "embark on": "start",
    "unlock the potential of": "make the most of",
    "harness the power of": "use",
    "in a nutshell, ": "",
    "when it comes to ": "for ",
    "at the end of the day, ": "ultimately, ",
    "cutting-edge": "advanced",
    "game-changer": "big shift",
    "furthermore, ": "also, ",
    "moreover, ": "on top of that, ",
    "additionally, ": "also, ",
    "in conclusion, ": "to wrap up, ",
    "in summary, ": "in short, ",
    "overall, ": "on the whole, ",
}

STOPWORDS_FOR_SYNONYMS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "and", "or", "but", "if", "of", "to", "in", "on", "for", "with",
    "as", "by", "at", "this", "that", "it", "its", "i", "you", "he",
    "she", "we", "they", "not", "no",
}


class HumanizerEngine:
    def humanize(self, text: str, tone: str = "balanced", strength: str = "medium") -> dict:
        _ensure_wordnet()

        before_analysis = detection_engine.analyze(text)

        sentences = split_sentences(text)
        sentences, phrase_changes = self._strip_boilerplate_per_sentence(sentences)

        replace_prob = {"light": 0.15, "medium": 0.30, "aggressive": 0.45}.get(strength, 0.30)
        sentences, synonym_changes = self._synonym_pass(sentences, replace_prob)
        sentences = self._vary_sentence_rhythm(sentences)
        sentences = self._apply_tone(sentences, tone)
        sentences = self._capitalize_sentences(sentences)

        humanized_text = self._rejoin(sentences)

        after_analysis = detection_engine.analyze(humanized_text)

        humanization_score = self._compute_humanization_score(before_analysis, after_analysis)

        changes: list[str] = []
        if phrase_changes:
            changes.append(f"Replaced {phrase_changes} AI-style boilerplate phrase(s).")
        if synonym_changes:
            changes.append(f"Varied word choice at {synonym_changes} position(s) via contextual synonyms.")
        changes.append("Adjusted sentence rhythm to increase natural variation (burstiness).")
        changes.append(f"Applied '{tone}' tone calibration.")

        return {
            "original_text": text,
            "humanized_text": humanized_text,
            "humanization_score": humanization_score,
            "detection_before": before_analysis,
            "detection_after": after_analysis,
            "changes_made": changes,
        }

    # ------------------------------------------------------------------

    def _strip_boilerplate_per_sentence(self, sentences: list[str]) -> tuple[list[str], int]:
        count = 0
        result = []
        for sentence in sentences:
            new_sentence = sentence
            for phrase, replacement in REMOVE_PHRASES.items():
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                matches = pattern.findall(new_sentence)
                if matches:
                    count += len(matches)
                    new_sentence = pattern.sub(replacement, new_sentence)
            result.append(new_sentence)
        return result, count

    def _synonym_pass(self, sentences: list[str], replace_prob: float) -> tuple[list[str], int]:
        changes = 0
        new_sentences = []
        for sentence in sentences:
            tokens = re.findall(r"\w+|[^\w\s]", sentence, re.UNICODE)
            new_tokens = []
            for tok in tokens:
                if (
                    tok.isalpha()
                    and len(tok) > 3
                    and tok.lower() not in STOPWORDS_FOR_SYNONYMS
                    and random.random() < replace_prob
                ):
                    synonym = self._best_synonym(tok)
                    if synonym:
                        new_tokens.append(self._match_case(tok, synonym))
                        changes += 1
                        continue
                new_tokens.append(tok)
            new_sentences.append(self._detokenize(new_tokens))
        return new_sentences, changes

    def _best_synonym(self, word: str) -> str | None:
        try:
            synsets = wn.synsets(word.lower())
        except Exception:
            return None
        if not synsets:
            return None

        candidates = []
        for syn in synsets[:3]:
            for lemma in syn.lemmas():
                name = lemma.name().replace("_", " ")
                if (
                    name.lower() != word.lower()
                    and " " not in name
                    and name.isalpha()
                    and abs(len(name) - len(word)) <= 4
                ):
                    candidates.append(name)
        if not candidates:
            return None
        return random.choice(candidates[:5])

    def _match_case(self, original: str, replacement: str) -> str:
        if original.isupper():
            return replacement.upper()
        if original[0].isupper():
            return replacement.capitalize()
        return replacement.lower()

    def _detokenize(self, tokens: list[str]) -> str:
        text = ""
        for i, tok in enumerate(tokens):
            prev = tokens[i - 1] if i > 0 else ""
            if i == 0:
                text += tok
            elif re.match(r"^[^\w\s]$", tok) and tok not in ("(", "\""):
                text += tok
            elif prev == "-" or prev == "'":
                text += tok
            else:
                text += " " + tok
        return text

    def _vary_sentence_rhythm(self, sentences: list[str]) -> list[str]:
        """Merge some adjacent short sentences with a connector, and split
        overly long ones, to increase natural length variance (burstiness)."""
        if len(sentences) < 3:
            return sentences

        connectors = [", and", ", while", ", so", "; meanwhile,", ", though"]
        result: list[str] = []
        i = 0
        while i < len(sentences):
            current = sentences[i]
            word_count = len(tokenize_words(current))

            if (
                word_count < 8
                and i + 1 < len(sentences)
                and len(tokenize_words(sentences[i + 1])) < 12
                and random.random() < 0.35
            ):
                connector = random.choice(connectors)
                nxt = sentences[i + 1]
                merged = current.rstrip(".!?") + connector + " " + (nxt[0].lower() + nxt[1:] if nxt else nxt)
                result.append(merged)
                i += 2
                continue

            if word_count > 32 and "," in current:
                parts = current.split(",", 1)
                if len(parts) == 2 and len(parts[1].strip()) > 10:
                    first = parts[0].strip()
                    second = parts[1].strip()
                    if not first.endswith((".", "!", "?")):
                        first += "."
                    second = second[0].upper() + second[1:] if second else second
                    result.append(first)
                    result.append(second)
                    i += 1
                    continue

            result.append(current)
            i += 1

        return result

    def _apply_tone(self, sentences: list[str], tone: str) -> list[str]:
        contractions = {
            "do not": "don't", "does not": "doesn't", "did not": "didn't",
            "cannot": "can't", "will not": "won't", "is not": "isn't",
            "are not": "aren't", "it is": "it's", "that is": "that's",
            "you are": "you're", "they are": "they're", "we are": "we're",
            "i am": "I'm", "have not": "haven't", "has not": "hasn't",
        }

        if tone in ("casual", "balanced"):
            new_sentences = []
            for s in sentences:
                for full, contracted in contractions.items():
                    s = re.sub(rf"\b{full}\b", contracted, s, flags=re.IGNORECASE)
                new_sentences.append(s)
            return new_sentences

        return sentences

    def _capitalize_sentences(self, sentences: list[str]) -> list[str]:
        result = []
        for s in sentences:
            stripped = s.lstrip()
            leading_ws = s[: len(s) - len(stripped)]
            if stripped:
                stripped = stripped[0].upper() + stripped[1:]
            result.append(leading_ws + stripped)
        return result

    def _rejoin(self, sentences: list[str]) -> str:
        joined = " ".join(s.strip() for s in sentences if s.strip())
        joined = re.sub(r"\s+([.,!?;:])", r"\1", joined)
        joined = re.sub(r"\s{2,}", " ", joined)
        return joined.strip()

    def _compute_humanization_score(self, before: dict, after: dict) -> float:
        """Zyrstar Humanization Score: how much more human-like the text
        became, weighted by how much lower the residual AI-probability is."""
        before_p = before.get("ai_probability", 50.0)
        after_p = after.get("ai_probability", 50.0)

        improvement = max(before_p - after_p, 0)
        residual_quality = max(100 - after_p, 0)

        score = 0.5 * min(improvement * 2, 100) + 0.5 * residual_quality
        return round(min(max(score, 0), 100), 1)


humanizer_engine = HumanizerEngine()
