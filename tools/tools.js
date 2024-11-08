const tools = [
    {
        "name": "get_reservation",
        "description": "Looks up a reservation by customer name or date.",
        "input_schema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "enum": ["customer_name", "date"],
                    "description": "The attribute to search for a reservation by customer_name or date."
                },
                "value": {
                    "type": "string",
                    "description": "The value to match for the specified attribute."
                }
            },
            "required": ["key", "value"]
        }
    },
    {
        "name": "get_reservation_by_id",
        "description": "Retrieves the details of a specific reservation based on the reservation ID. Returns the customer_name, phone number, number of people, date, time. ",
        "input_schema": {
            "type": "object",
            "properties": {
                "reservation_id": {
                    "type": "string",
                    "description": "The unique identifier for the reservation."
                }
            },
            "required": ["reservation_id"]
        }
    },
    {
        "name": "add_reservation",
        "description": "Add a reservation, which consists of a customer_name, phone, number of people, date, time.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {
                    "type": "string",
                    "description": "The customer's name and surname"
                },
               "phone": {
                "type": "string",
                "description": "The customer's phone number, mobile or line"
              },
              "num_people": {
                "type": "integer",
                "description": "The number of people will come to the restaurant to have diner/lunch"
              },
              "date": {
                "type": "string",
                "description": "Date of the reservation, yyyy-mm-dd."
              },
              "time": {
                "type": "string",
                "description": "The time of the reservation hh:mm"
              },
            },
            "required": ["customer_name", "phone", "num_people",  "date",  "time"]
        }
    },
    {
        "name": "cancel_reservation",
        "description": "Cancels a reservation based on a provided reservation_id.  Only reservations in the future can be cancelled",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The reservation_id pertaining to a particular reservation"
                }
            },
            "required": ["reservation_id"]
        }
    }
]
module.exports.tools=tools;