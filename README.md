# Azure function for tracking twitter unfollowers

This is a time triggered function set to run once a day that stores your list of followers in a file in Azure Blob Storage. 

Whenever it finds someone unfollowed you, it sends you an email.
