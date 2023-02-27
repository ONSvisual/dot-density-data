export default [
  {
    "varCode": "health_in_general",
    "classCode": "health_in_general_4a",
    "filePath": "./input/data/TS037_health_in_general_4a_2021.csv.gz",
    "varName": "General health",
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
    "filePath": "./input/data/TS038_disability_3a_2021.csv.gz",
    "varName": "Disability",
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