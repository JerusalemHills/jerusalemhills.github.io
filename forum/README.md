Updated Project Plan Report: Adding a Forum to JerusalemHills.com (Static Site on GitHub Pages) Without Cookies

Introduction

JerusalemHills.com is a static website hosted on GitHub Pages. The goal is to integrate a forum that allows users to post messages, interact in real time, and participate in discussions while maintaining the static nature of the site. The forum will utilize GunDB for real-time updates, GitHub Actions and webhooks for committing accumulated messages, and will implement moderation features to filter inappropriate content. This updated plan outlines the approach, key implementation details, and moderation strategies while ensuring that no cookies are used in the process, aligning with privacy and compliance goals.

1. Real-Time Forum with GunDB (Without Cookies)

Overview of GunDB

GunDB is a decentralized, peer-to-peer (P2P) database that facilitates real-time data synchronization between client-side applications. It does not require cookies or a central server, making it a suitable choice for creating a real-time forum on a static site. Each user will connect to GunDB directly from their browser, and messages will be shared instantly between users in real time.

Implementation Details (Without Cookies):
	•	Session Handling: Instead of using cookies for session management, each user’s browser will be assigned a temporary session ID for the duration of their interaction. This session ID can be generated randomly using crypto.randomUUID() or another unique identifier generation method available in the browser.
	•	This session ID will be used to associate messages with the user for the session, but will not persist across sessions (i.e., once the browser is closed or the page is refreshed, the session ID is discarded).
	•	Forum Structure:
	•	Each thread or room in the forum will have its own GunDB node. Messages posted to a thread will be stored in GunDB as real-time nodes, and will be automatically synchronized with all connected users.
	•	The session ID will temporarily identify users during the session and allow them to post messages. Once a user’s session ends (e.g., after closing the browser or refreshing the page), their session ID and messages will no longer be tracked.

Steps for Implementation:
	1.	Integrate GunDB into the forum’s front-end: Embed the GunDB JavaScript library to handle real-time data storage and synchronization between users.
	2.	Session-based Identity: Upon page load, generate a temporary session ID and associate it with messages sent during the session.
	3.	Display Messages: New messages will be dynamically displayed as they are posted by any user, leveraging GunDB’s real-time synchronization.

2. GitHub Webhooks and Actions for Committing Forum Data (Without Cookies)

While GunDB provides real-time updates, the forum data needs to be permanently stored in the GitHub repository for static access. GitHub Actions and webhooks will be used to commit accumulated messages, ensuring that the forum remains static and accessible.

Plan for Committing Data:
	1.	Accumulating Messages: As users post messages, they will be temporarily stored in GunDB. Once a threshold of messages is reached (e.g., 50 messages), a batch of these messages will be committed to the GitHub repository.
	2.	GitHub Repository Structure:
	•	Forum threads will be stored in Markdown or JSON files in the GitHub repository.
	•	The accumulated messages will be written to these files.
	3.	GitHub Webhooks:
	•	A webhook will trigger when a batch of messages is ready to be committed.
	4.	GitHub Actions:
	•	The webhook will initiate a GitHub Action that updates the repository with the latest batch of messages.
	•	The static site will automatically update via GitHub Pages after the commit is pushed.

Steps for Implementation:
	1.	Set up webhook: Configure a webhook that listens for the posting of new messages or a threshold of messages being reached.
	2.	Create a GitHub Action: Set up an action to commit the messages to the repository once the batch threshold is reached.
	3.	Automatic Deployment: GitHub Pages will automatically deploy the updated content after the commit.

3. Moderation Strategy (Without Cookies)

Moderation will be key to ensuring the quality and appropriateness of content. Without cookies, moderation will rely on session-based management and local client-side filtering.

Moderation Features:
	1.	Bad Word Filtering:
	•	A list of predefined bad words will be used to filter out inappropriate content before it is posted to GunDB.
	•	If a post contains any words from this list, it will be flagged and prevented from being stored in GunDB.
	2.	Link Filtering:
	•	Any links submitted in forum posts will be checked for validity and whether they are from banned sources.
	•	If a post includes a link from a suspicious domain, the link will be flagged, and the post may be blocked or flagged for review.
	3.	User Flagging:
	•	Users can flag posts that they find inappropriate by clicking a “Flag” button.
	•	Flagged content will be placed in a review queue. Although the flagging will be session-based and will not persist after the browser session ends, flagged posts will be visible in the moderator dashboard for manual review.

Steps for Implementation:
	1.	Bad Word Filtering: Implement JavaScript logic on the front-end to scan posts for offensive language before submitting to GunDB.
	2.	Link Filtering: Add a function to check URLs in posts and block those that are from banned sources.
	3.	User Flagging: Add a flagging option next to each post, allowing users to report inappropriate content.

4. Compliance with GitHub Policies

User Privacy and Data Collection:
	•	GitHub’s Terms of Service require users not to violate privacy laws or engage in unlawful data practices. Since no personal user data is being collected (other than anonymous session IDs), this project should be in compliance with GitHub’s policies.
	•	Since no cookies or persistent identifiers are used, there is no risk of violating privacy regulations related to data collection and user tracking.

Content Moderation and GitHub’s Acceptable Use Policy:
	•	All content submitted to the forum will be monitored for violations of GitHub’s Acceptable Use Policy, which prohibits harmful, illegal, or abusive content.
	•	A Code of Conduct and Terms of Service will be displayed on the forum, informing users about acceptable behavior and outlining potential consequences for violations.

5. Avoiding Cookies Summary

This updated approach focuses on avoiding cookies by using a session-based identity generated locally in the browser. GunDB provides the infrastructure for real-time updates, while GitHub Actions and webhooks ensure that data is committed to the GitHub repository periodically. The entire system will remain anonymous and cookie-free, providing an optimal solution for real-time interactions without compromising privacy.

Conclusion

By utilizing GunDB for real-time updates, GitHub Actions for committing forum data, and implementing a robust moderation system, we can build an interactive forum for JerusalemHills.com without the need for cookies. This solution ensures compliance with GitHub’s Terms of Service, maintains privacy, and provides a streamlined, anonymous user experience.

This plan ensures the site can host a dynamic, interactive forum while maintaining the principles of a static website.

Let me know if you need further elaboration or additional steps!