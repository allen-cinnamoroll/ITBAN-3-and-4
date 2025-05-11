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
        municipality: Municipalities,  # Changed to use Municipalities enum
        created_at: datetime = datetime.utcnow()
    ):
        self.budget = budget
        self.destination_type = destination_type
        self.trip_duration = trip_duration
        self.travel_season = travel_season
        self.number_of_people = number_of_people
        self.municipality = municipality
        self.created_at = created_at

    def to_dict(self):
        return {
            "budget": self.budget,
            "destination_type": self.destination_type.value,
            "trip_duration": self.trip_duration,
            "travel_season": self.travel_season.value,
            "number_of_people": self.number_of_people,
            "municipality": self.municipality.value,
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
            created_at=data.get("created_at", datetime.utcnow())
        )