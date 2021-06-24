# Configuring the workflow API

**Make sure your migrations are all setup and you can see workflow API in the Django admin panel**

Follow the order to setup the workflow [There is already a sample workflow setup up]
 
 ### Setting up states:
 
Attributes:

 - Name [Has to be unique]
 - Description 
 - *boolean* Public: Used for making all the projects public for that particular state (eg. Published state should have this true)
 - *boolean* Report: Used for making a state which represents "Reported" (Make sure only one state has this value set to true)
 
 Suggested States:
 
 - Draft
 - Review 
 - Published
 - Review

### Setting up Groups:
Every group has a custom group model attached to it which lets you define the following parameters:

Attributes:
 - Other Circuit Accessible States: This is a many select field which specifies the states which can be accessed by that specific group (For example, for Contributor, it can only access other user's projects which are published and for reviewer, it can access Review, Reported and Published as well)
 -  *boolean*  Is Arduino: Specifies whether the role is for arduino or e-sim (True for arduino and false for esim)
 - *boolean*  Is Type Reviewer: This gives that group the ability to review the reported circuits.
 - *boolean* Is Default: This defines which roles should be assigned to a new user.
Suggested Roles:

 - Contributor [Arduino]
 - Contributor [E-Sim]
 - Reviewer [Arduino]
 - Reviewer [E-Sim]

### Setting up Transitions:

Attributes:

 - Name
 - Role: Multi-select for who can make the transitions
 - From-State
 - To-State
 - *boolean*  Allowed for creator: Whether the creator itself should be able to do the transition (For example from Draft to Review, it is allowed but for Review to Published, it should not be allowed)
 - *boolean* Only for creator: Restrict the transition only to the creator (For example, only the creator should be able to make the transition from Draft to Review)
 
 Suggested Transitions
 - Draft to Review
 - Review to Published
 - Published to Reported
 - Reported to Draft
 - Reported to Published

 
 
### Things to note:

 - The workflow API is being tested on E-Sim cloud and not on the Arduino Simulator as of yet.

