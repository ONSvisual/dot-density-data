export default [
  {
    "varCode": "health_in_general",
    "classCode": "health_in_general_4a",
    "group": "Health",
    "filePath": "./input/data/TS037_health_in_general_4a_2021.csv.gz",
    "varName": "General health",
    "unit": "person",
    "desc": "How people rate their general health.",
    "long_desc": "A person's assessment of the general state of their health from very good to very bad. This assessment is not based on a person's health over any specified period of time.",
    "baseUrl": "https://ons-dp-prod-census-maps-huc.s3.eu-west-2.amazonaws.com",
    "categories": [
      {
        "code": "health_in_general_4a-001",
        "name": "Very good or good health"
      },
      {
        "code": "health_in_general_4a-002",
        "name": "Fair health"
      },
      {
        "code": "health_in_general_4a-003",
        "name": "Bad or very bad health"
      }
    ]
  },
  {
    "varCode": "disability",
    "classCode": "disability_3a",
    "group": "Health",
    "filePath": "./input/data/TS038_disability_3a_2021.csv.gz",
    "varName": "Disability",
    "unit": "person",
    "desc": "People with a long-term health problem or disability, including conditions or illnesses relating to old-age.",
    "long_desc": "People who assessed their day-to-day activities as limited by long-term physical or mental health conditions or illnesses are considered disabled. This definition of a disabled person meets the harmonised standard for measuring disability and is in line with the Equality Act (2010).",
    "baseUrl": "https://ons-dp-prod-census-maps-huc.s3.eu-west-2.amazonaws.com",
    "categories": [
      {
        "code": "disability_3a-001",
        "name": "Disabled under the Equality Act"
      },
      {
        "code": "disability_3a-002",
        "name": "Not disabled under the Equality Act"
      }
    ]
  },
  {
    "varCode": "is_carer",
    "classCode": "is_carer_5a",
    "filePath": "./input/data/TS039_is_carer_5a_2021.csv.gz",
    "varName": "Provision of unpaid care",
    "unit": "person",
    "desc": "Hours of unpaid care provided per week.",
    "long_desc": "An unpaid carer may look after, give help or support to anyone who has long-term physical or mental ill-health conditions, illness or problems related to old age.  \n\nThis does not include any activities as part of paid employment. \n\nThis help can be within or outside of the carer's household.",
    "baseUrl": "https://ons-dp-prod-census-maps-huc.s3.eu-west-2.amazonaws.com",
    "categories": [
      {
        "code": "is_carer_5a-001",
        "name": "Provides no unpaid care"
      },
      {
        "code": "is_carer_5a-002",
        "name": "Provides 19 or less hours unpaid care a week"
      },
      {
        "code": "is_carer_5a-003",
        "name": "Provides 20 to 49 hours unpaid care a week"
      },
      {
        "code": "is_carer_5a-004",
        "name": "Provides 50 or more hours unpaid care a week"
      }
    ]
  }
]