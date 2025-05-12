from datetime import datetime
from enum import Enum

# Numerical mappings for categorical data
class TravelSeason(Enum):
    SUMMER = 1      # Summer (March-May)
    RAINY = 2       # Rainy (June-October)
    HOLIDAY = 3     # Holiday Season (November-February)

class DestinationType(Enum):
    BEACH = 1
    MOUNTAIN = 2
    CULTURAL = 3
    NATURE = 4
    ISLAND = 5

class Municipalities(Enum):
    BOSTON = 1
    CATEEL = 2
    BAGANGA = 3
    CARAGA = 4
    MANAY = 5
    TARRAGONA = 6
    BANAYBANAY = 7
    LUPON = 8
    MATI = 9
    SAN_ISIDRO = 10
    GOV_GENEROSO = 11

class GroupType(Enum):
    SOLO = 1
    COUPLE = 2
    FAMILY = 3
    FRIENDS = 4

class TravelPurpose(Enum):
    RELAXATION = 1
    ADVENTURE = 2
    FOOD_TRIP = 3
    CULTURAL_DISCOVERY = 4
    NATURE_APPRECIATION = 5

# Mapping dictionaries for reference
SEASON_MAPPING = {
    "Summer (March-May)": TravelSeason.SUMMER.value,
    "Rainy (June-October)": TravelSeason.RAINY.value,
    "Holiday Season (November-February)": TravelSeason.HOLIDAY.value
}

DESTINATION_MAPPING = {
    "Beach": DestinationType.BEACH.value,
    "Mountain": DestinationType.MOUNTAIN.value,
    "Cultural": DestinationType.CULTURAL.value,
    "Nature": DestinationType.NATURE.value,
    "Island": DestinationType.ISLAND.value
}

MUNICIPALITY_MAPPING = {
    "Boston": Municipalities.BOSTON.value,
    "Cateel": Municipalities.CATEEL.value,
    "Baganga": Municipalities.BAGANGA.value,
    "Caraga": Municipalities.CARAGA.value,
    "Manay": Municipalities.MANAY.value,
    "Tarragona": Municipalities.TARRAGONA.value,
    "Banaybanay": Municipalities.BANAYBANAY.value,
    "Lupon": Municipalities.LUPON.value,
    "Mati City": Municipalities.MATI.value,
    "San Isidro": Municipalities.SAN_ISIDRO.value,
    "Governor Generoso": Municipalities.GOV_GENEROSO.value
}

GROUP_TYPE_MAPPING = {
    "Solo": GroupType.SOLO.value,
    "Couple": GroupType.COUPLE.value,
    "Family": GroupType.FAMILY.value,
    "Friends": GroupType.FRIENDS.value
}

TRAVEL_PURPOSE_MAPPING = {
    "Relaxation": TravelPurpose.RELAXATION.value,
    "Adventure": TravelPurpose.ADVENTURE.value,
    "Food Trip": TravelPurpose.FOOD_TRIP.value,
    "Cultural Discovery": TravelPurpose.CULTURAL_DISCOVERY.value,
    "Nature Appreciation": TravelPurpose.NATURE_APPRECIATION.value
}

class TravelInputModel:
    def __init__(
        self,
        budget: float,
        destination_type: int,
        trip_duration: int,
        travel_season: int,
        number_of_people: int,
        municipality: int,
        group_type: int,
        travel_purpose: int,
        system_satisfaction_score: int = None,
        analytics_satisfaction_score: int = None,
        created_at: datetime = datetime.utcnow()
    ):
        self.budget = budget
        self.destination_type = destination_type
        self.trip_duration = trip_duration
        self.travel_season = travel_season
        self.number_of_people = number_of_people
        self.municipality = municipality
        self.group_type = group_type
        self.travel_purpose = travel_purpose
        
        # Validate system satisfaction score range
        if system_satisfaction_score is not None and not (1 <= system_satisfaction_score <= 5):
            raise ValueError("System satisfaction score must be between 1 and 5")
        self.system_satisfaction_score = system_satisfaction_score

        # Validate analytics satisfaction score range
        if analytics_satisfaction_score is not None and not (1 <= analytics_satisfaction_score <= 5):
            raise ValueError("Analytics satisfaction score must be between 1 and 5")
        self.analytics_satisfaction_score = analytics_satisfaction_score

        self.created_at = created_at

    def to_dict(self):
        return {
            "budget": self.budget,
            "destination_type": self.destination_type,
            "trip_duration": self.trip_duration,
            "travel_season": self.travel_season,
            "number_of_people": self.number_of_people,
            "municipality": self.municipality,
            "group_type": self.group_type,
            "travel_purpose": self.travel_purpose,
            "system_satisfaction_score": self.system_satisfaction_score,
            "analytics_satisfaction_score": self.analytics_satisfaction_score,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(data: dict):
        # Convert string inputs to numerical values if needed
        destination_type = data["destination_type"] if isinstance(data["destination_type"], int) else DESTINATION_MAPPING[data["destination_type"]]
        travel_season = data["travel_season"] if isinstance(data["travel_season"], int) else SEASON_MAPPING[data["travel_season"]]
        municipality = data["municipality"] if isinstance(data["municipality"], int) else MUNICIPALITY_MAPPING[data["municipality"]]
        group_type = data["group_type"] if isinstance(data["group_type"], int) else GROUP_TYPE_MAPPING[data["group_type"]]
        travel_purpose = data["travel_purpose"] if isinstance(data["travel_purpose"], int) else TRAVEL_PURPOSE_MAPPING[data["travel_purpose"]]

        return TravelInputModel(
            budget=float(data["budget"]),
            destination_type=destination_type,
            trip_duration=int(data["trip_duration"]),
            travel_season=travel_season,
            number_of_people=int(data["number_of_people"]),
            municipality=municipality,
            group_type=group_type,
            travel_purpose=travel_purpose,
            system_satisfaction_score=int(data.get("system_satisfaction_score")) if "system_satisfaction_score" in data else None,
            analytics_satisfaction_score=int(data.get("analytics_satisfaction_score")) if "analytics_satisfaction_score" in data else None,
            created_at=data.get("created_at", datetime.utcnow())
        )