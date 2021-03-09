# Summary of Implementation of Task IV

 The problem statement revolved around creating a dynamic workflow, giving users roles,add 'states' to circuits and history generation.
 ## Implementation Steps:

 1. Usage and extension of publish API, adding model State (implemented in workflow API) to the Circuit model as publications for the circuits will be handled from that API itself.
 2. Used Built-in Django Groups are used as they already are quite flexible and can be used as *roles* for a user.
 3. For defining transition and permissions for the state switching, wrote a model named Transition which has allowed *roles, from_state and to_state* as the attributes
 4. The admin can define transitions from one state to another with giving access to which roles can make those transitions and if the transition is allowed for the creator of the circuit. [When the reviewer creates a circuit, he is considered as a Contributor and thus, the reviewer for that circuit must be some other reviewer other than the one who created it.]
 5. A Transition History model is created in workflow API to keep track of which circuit's state has been changed by whom and from what state to what state.
 ## Addition and Changes in existing code base:
 
 1. Django now uses IST [Asia/Kolkata] timezone. [Changed settings.py of project]
 2. Additions in publish models to implement states for circuits
 3. Additions in user groups to have custom attributes like is the role defined for e-Sim or Arduino.
 4. Changes in Publish views.
 5. Additions in e-Sim dashboard front-end.
 ## Features:
 
 11. API-Based Solution
 12. Implemented for e-sim circuits.
 13. Dynamic user roles [A user can have multiple roles with separate roles for E-Sim and Arduino circuits]
 14. Ability of admin to add in multiple states and transitions attached to specific roles to the workflow.
 15. A single role can have control over the workflow towards multiple transitions.
 16. Additions of workflow API  into existing Swagger documentation
 17. Code written to seamlessly work with the existing code
 18. Rudimentary front-end implementation using ReactJS w/ MaterialUI and Redux [Integrated into existing front-end of E-Sim]
 19. Integrated transition history to keep track of how,when,by whom and which states are being changed.
## API Request:
 - `/workflow/role`: gives logged in user roles.
 - `/workflow/state/{circuit_id}`: get and post state of the given circuit ID
 - `/workflow/othercircuits/{state_name}`: get all other circuits of a specific state [uses accessible_states of the groups for permissions]

 
## Screenshots:

![Swagger docs updated](https://i.ibb.co/FV6jHTs/gnome-shell-screenshot-10-NYZ0.png)Swagger documentation updated.

![State Dashboard](https://i.ibb.co/BVdM5xJ/gnome-shell-screenshot-7-OCSZ0.png)
This  is the admin panel where we can create states, give descriptions and let admin decide if circuit with that particular state is publicly visible.
![Transitions](https://i.ibb.co/N2X4ZyF/gnome-shell-screenshot-BGB4-Z0.png)
These are the different transitions currently present. More transitions can be added,edited or removed.
![Transition Edit](https://i.ibb.co/3WPcNNY/gnome-shell-screenshot-GI7-PZ0.png)
Complete control over transitions like which roles are given permission and whether this transition is allowed for creator of the circuit. [When the reviewer creates a circuit, he cannot change the state from Review to Published because allowed for creator is false.]
![Transition History](https://i.ibb.co/KWtB0Xd/gnome-shell-screenshot-UVFYZ0.png)
Admin has an access to see when and what states where changed of which circuits and by whom.
![Individual Transition History](https://i.ibb.co/njywKN7/gnome-shell-screenshot-XXPZZ0.png)
The admin can view the state and transition history for that circuit in the django-admin panel.
![Dashboard](https://i.ibb.co/Mf9WpNf/gnome-shell-screenshot-R4-D7-Z0.png)
Updated Dashboard sidebar to show logged-in user roles and my Publications tab.

## Demo Video:
[Click here](https://youtu.be/UdPZktMdv4s)
## Future Roadmap:
 - Full Integration of Front-end.
  - Ability to add multiple workflows.
 - Notifications for state changes to the circuit owners.
 - Making use of Publication model from Publish API.
 - Converting circuit from save API to publish API.

 
 


