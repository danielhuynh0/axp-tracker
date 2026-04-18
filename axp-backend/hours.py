import math


def distribute_hours(total_hours: float, weights: dict[int, float]) -> dict[int, float]:
    UNIT = 0.25
    active = {k: v for k, v in weights.items() if v > 0}
    if not active:
        return {}

    total_weight = sum(active.values())
    normalized = {k: v / total_weight for k, v in active.items()}
    raw = {k: total_hours * w for k, w in normalized.items()}
    base = {k: math.floor(v / UNIT) * UNIT for k, v in raw.items()}

    remainder_units = round((total_hours - sum(base.values())) / UNIT)
    fractions = {k: raw[k] - base[k] for k in raw}
    sorted_cats = sorted(fractions.keys(), key=lambda k: fractions[k], reverse=True)

    result = dict(base)
    for i in range(remainder_units):
        result[sorted_cats[i % len(sorted_cats)]] += UNIT

    return result
