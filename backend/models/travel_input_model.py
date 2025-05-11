from datetime import datetime
from enum import Enum

class TravelSeason(Enum):
    SUMMER = "Summer (March-May)"
    RAINY = "Rainy (June-October)"
    HOLIDAY = "Holiday Season (November-February)"

class DestinationType(Enum):
    BEACH = "Beach"
    MOUNTAIN = "Mountain"
    CULTURAL = "Cultural"
    NATURE = "Nature"
    CITIES = "Cities"

class Municipalities(Enum):
    BOSTON = "Boston"
    CATEEL = "Cateel"
    BAGANGA = "Baganga"
    CARAGA = "Caraga"
    MANAY = "Manay"
    TARRAGONA = "Tarragona"
    BANAYBANAY = "Banaybanay"
    LUPON = "Lupon"
    MATI = "Mati City"
    SAN_ISIDRO = "San Isidro"
    GOV_GENEROSO = "Governor Generoso"

class TravelInputModel:
    def __init__(
        self,
        budget: float,
        destination_type: DestinationType,
        trip_duration: int,
        travel_season: TravelSeason,
        number_of_people: int,
        municipality: Municipalities,
        system_satisfaction_score: int = None,
        analytics_satisfaction_score: int = None,  # Added new field
        created_at: datetime = datetime.utcnow()
    ):
        self.budget = budget
        self.destination_type = destination_type
        self.trip_duration = trip_duration
        self.travel_season = travel_season
        self.number_of_people = number_of_people
        self.municipality = municipality
        
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
            "destination_type": self.destination_type.value,
            "trip_duration": self.trip_duration,
            "travel_season": self.travel_season.value,
            "number_of_people": self.number_of_people,
            "municipality": self.municipality.value,
            "system_satisfaction_score": self.system_satisfaction_score,
            "analytics_satisfaction_score": self.analytics_satisfaction_score,  # Added new field
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(data: dict):
        return TravelInputModel(
            budget=float(data["budget"]),
            destination_type=DestinationType(data["destination_type"]),
            trip_duration=int(data["trip_duration"]),
            travel_season=TravelSeason(data["travel_season"]),
            number_of_people=int(data["number_of_people"]),
            municipality=Municipalities(data["municipality"]),
            system_satisfaction_score=int(data.get("system_satisfaction_score")) if "system_satisfaction_score" in data else None,
            analytics_satisfaction_score=int(data.get("analytics_satisfaction_score")) if "analytics_satisfaction_score" in data else None,  # Added new field
            created_at=data.get("created_at", datetime.utcnow())
        )