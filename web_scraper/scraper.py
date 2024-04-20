import requests
import re
import csv
import time

rows = []

response = requests.get("https://academiccatalog.umd.edu/sitemap.xml")
assert response.status_code == 200

xml = response.text
linkList = re.findall(
    r"https://academiccatalog\.umd\.edu/undergraduate/approved-courses/.{4}", xml
)

#print(linkList)

with open("linkList.csv", "w", newline="") as file:
    writer = csv.writer(file, dialect='excel')
    writer.writerow(["Link"])
    for link in linkList:
        writer.writerow([link])

for link in linkList:
    response = requests.get(link)
    assert response.status_code == 200

    html = response.text
    courseList = re.findall(r"<h3>.*</h3>", html)
    time.sleep(10)

    for course in courseList:
        course = course.replace("<h3>", "").replace("</h3>", "")
        rows.append(course)

with open("courseList.csv", "w", newline="") as file:
    writer = csv.writer(file, dialect='excel')
    writer.writerow(["Course"])
    for row in rows:
        writer.writerow([row])