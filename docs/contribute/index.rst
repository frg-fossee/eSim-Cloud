=================
Contribute
=================

Want to contribute? eSim and Arduino on Cloud is an open source project and we welcome contributions from all. We would be very happy to collaborate with you. To contribute to this project please make sure that you read this document and follow the guidelines given.

Workflow
#######################

This project is on Git and we follow the git working model. If you are new to git then try familiarizing yourself with git first. You may also refer (https://git-scm.com/book/en/v2).


Fork Repository and Choose Branch
*********************************

* The first step is to fork the repository so that you have your own repository on which you can work on.

* You must then identify the branch on which you would like to contribute. You are free to create a new branch in your repository but make sure that you create it from the desired working branch only.


Contribute to a branch
**********************

* Once the branch is chosen, you can start contributing. Make sure that you follow the 'Contributing guidelines'.
* We use GitHub Actions for continuous integrations that runs linting and testing operations.
* Commit your code to your forked repository on a regular basis with meaningful commit messages. 
* There might be some changes to the original repository which will not reflect in your forked repository automatically. If you want to update it, sync it using the steps given in the link: https://help.github.com/articles/syncing-a-fork/


Make a pull request
*******************

* When you feel that you are ready to merge your contributions into our repository, create a pull request.
* Select an appropriate label from the list E.g. enhancement, bug fix, etc.
* Each pull request should be for a single feature or addressing a single problem only. 
* Avoid handling multiple features or bug fixes into one pull request.
* Ensure that you create it for the appropriate branch only.
* Write a brief description about your contribution and what problem does it solve. A pull request with good description is always appreciated and will be accepted easily.
* Once the pull request is made, GitHub actions will show linting errors if any and the different test results. If all goes well then 'All checks have passed' will be displayed on your pull request. If any one fails, you can check the details.
* Our reviewing team will review your pull request and will interact with you by posting comments. You may be asked to modify incase there is any issue.


Contributing Guidelines
#######################

* You can contribute by: (a) fixing a bug, (b) improving the UI, (c) creating a new feature, (d) updating the documentation, etc.
* Before you start contributing, first browse through the issues and pull requests to know whether someone else has already fixed the issue or is already working on the feature.
* Follow the django coding style: https://docs.djangoproject.com/en/dev/internals/contributing/writing-code/coding-style/
* If you are modifying or adding a feature then write unit test cases as well.
* Avoid unnecessary modification of existing code. Ofcourse, you are free to optimize and resolve bugs.
* Avoid duplication of code
* Break your code/logic into different functions and add comments for better understanding.
* If your contributions have some dependencies or they modify existing structure, then update the README.md file accordingly. Also feel free to add more documentation files.