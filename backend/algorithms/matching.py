def find_matches(resources, category, location):
    category = (category or "").strip().casefold()
    location = (location or "").strip().casefold()
    ranked = []
    for resource in resources:
        category_value = resource.category.casefold()
        location_value = resource.location.casefold()
        category_match = not category or category in category_value or category_value in category
        location_match = not location or location in location_value or location_value in location
        if category_match and location_match:
            score = int(bool(category) and category == category_value) * 2 + int(bool(location) and location_match)
            ranked.append((score, resource))
    ranked.sort(key=lambda item: (-item[0], item[1].id))
    return [resource for _, resource in ranked]