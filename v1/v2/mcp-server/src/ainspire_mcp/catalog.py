from __future__ import annotations

from typing import Literal, TypeAlias

Persona: TypeAlias = Literal["explorer", "builder", "strategist", "visionary"]
Language: TypeAlias = Literal["EN", "BM"]
Dimension: TypeAlias = Literal[
    "aiExposure",
    "aiApplication",
    "criticalJudgement",
    "aiProblemSolving",
]

_CATALOG: dict[str, dict[str, tuple[tuple[str, str], ...]]] = {
    "EN": {
        "explorer": (
            ("AI foundations and safe use", "Learn AI limitations, data privacy and how to verify outputs."),
            ("Your first practical AI task", "Try a small work task and compare the outcome with your original approach."),
            ("Peer-supported learning", "Ask an experienced colleague to review your results."),
        ),
        "builder": (
            ("AI prototyping and integration", "Build a small prototype with defined inputs and outputs."),
            ("Evaluation and testing", "Test normal cases, failures and risks before deployment."),
            ("Business value and governance", "Validate benefits, cost and control ownership with users."),
        ),
        "strategist": (
            ("Problem discovery and use-case framing", "Define the business problem, users and success measures."),
            ("Value and risk assessment", "Compare benefits, cost, security and output quality."),
            ("Cross-functional delivery", "Partner with builders and validate outcomes with business owners."),
        ),
        "visionary": (
            ("Responsible AI direction", "Align an AI portfolio with organisational priorities."),
            ("Adoption and change management", "Establish owners, learning support and adoption measures."),
            ("Scaling and value measurement", "Review pilot outcomes before expanding adoption."),
        ),
    },
    "BM": {
        "explorer": (
            ("Asas AI dan penggunaan selamat", "Pelajari batasan AI, privasi data dan cara menyemak jawapan."),
            ("Latihan tugasan pertama", "Cuba satu tugasan kecil dan bandingkan hasil dengan kerja asal."),
            ("Belajar bersama rakan", "Minta rakan berpengalaman menyemak hasil anda."),
        ),
        "builder": (
            ("Prototaip dan integrasi AI", "Bina prototaip kecil dengan input dan output yang jelas."),
            ("Pengujian dan penilaian", "Uji kes biasa, ralat dan risiko sebelum pelaksanaan."),
            ("Nilai perniagaan dan tadbir urus", "Sahkan manfaat, kos dan pemilik kawalan dengan pengguna."),
        ),
        "strategist": (
            ("Penemuan masalah dan kes penggunaan", "Takrifkan masalah, pengguna dan ukuran kejayaan."),
            ("Penilaian nilai dan risiko", "Bandingkan manfaat, kos, keselamatan dan kualiti output."),
            ("Pelaksanaan bersama pasukan", "Bekerjasama dengan pembina dan sahkan nilai bersama pemilik perniagaan."),
        ),
        "visionary": (
            ("Hala tuju AI yang bertanggungjawab", "Selaraskan keutamaan portfolio AI dengan matlamat organisasi."),
            ("Pengurusan perubahan", "Tetapkan pemilik, latihan dan ukuran penggunaan."),
            ("Pengembangan dan pengukuran nilai", "Semak hasil perintis sebelum memperluaskan penggunaan."),
        ),
    },
}


def get_learning_path(persona: Persona, language: Language) -> list[dict[str, str]]:
    """Return the three governed learning topics for a persona and language."""
    return [
        {"title": title, "description": description}
        for title, description in _CATALOG[language][persona]
    ]


def get_learning_catalog(language: Language) -> dict[str, list[dict[str, str]]]:
    """Return the learning topics for every supported persona."""
    return {persona: get_learning_path(persona, language) for persona in _CATALOG[language]}
