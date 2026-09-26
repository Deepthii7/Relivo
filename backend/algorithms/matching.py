def find_matches(resources, category, location):
    matches = []

    for resource in resources:
        category_match = (
            resource.category.lower()
            == category.lower()
        )

        location_match = (
            resource.location.lower()
            == location.lower()
        )

        if category_match and location_match:
            matches.append(resource)

    return matches