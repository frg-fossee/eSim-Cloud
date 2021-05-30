# Summary of Implementation of Task IV

 The problem statement revolved around creating a dynamic workflow, giving users roles,add 'states' to circuits and history generation.
 ## Implementation Steps:

 1. Usage and extension of publish API, adding model State (implemented in workflow API) to the Circuit model as publications for the circuits will be handled from that API itself.
 2. Used Built-in Django Groups are used as they already are quite flexible and can be used as *roles* for a user.
 3. For defining transition and permissions for the state switching, wrote a model named Transition which has allowed *roles, from_state and to_state* as the attributes
 4. The admin can define transitions from one state to another with giving access to which roles can make those transitions and if the transition is allowed for the creator of the circuit. (When the reviewer creates a circuit, he is considered as a Contributor and thus, the reviewer for that circuit must be some other reviewer other than the one who created it.)
 5. A Transition History model is created in workflow API to keep track of which circuit's state has been changed by whom and from what state to what state.
 ## Addition and Changes in existing code base:
 
 1. Django now uses IST [Asia/Kolkata] timezone. (Changed settings.py of project)
 2. Additions in publish models to implement states for circuits
 3. Additions in user groups to have custom attributes like is the role defined for e-Sim or Arduino.
 4. Changes in Publish views.
 5. Additions in e-Sim dashboard front-end.
 6. Changes in reducer and actions of dashboard and auth to integrate roles and notifications.
 7. Addition of basic notification UI in frontend.
 ## Features:
 
 1. API-Based Solution
 2. Implemented for e-sim circuits.
 3. Dynamic user roles (A user can have multiple roles with separate roles for E-Sim and Arduino circuits)
 4. Ability of admin to add in multiple states and transitions attached to specific roles to the workflow.
 5. A single role can have control over the workflow towards multiple transitions.
 6. Additions of workflow API  into existing Swagger documentation
 7. Code written to seamlessly work with the existing code
 8. Rudimentary front-end implementation using ReactJS w/ MaterialUI and Redux (Integrated into existing front-end of E-Sim)
 9. Integrated transition history to keep track of how,when,by whom and which states are being changed.
 10. Notifications for state changes to the circuit owners.
## API Request:
 - `/workflow/role`: gives logged in user roles.
 - `/workflow/state/{circuit_id}`: get and post state of the given circuit ID
 - `/workflow/othercircuits/{state_name}`: get all other circuits of a specific state (uses accessible_states of the groups for permissions)
 - `/workflow/notification`: get and post notifications for the given user

 
## Screenshots:

Swagger documentation updated.![Swagger docs updated](https://i.ibb.co/FV6jHTs/gnome-shell-screenshot-10-NYZ0.png)

This  is the admin panel where we can create states, give descriptions and let admin decide if circuit with that particular state is publicly visible.![State Dashboard](https://i.ibb.co/BVdM5xJ/gnome-shell-screenshot-7-OCSZ0.png)

These are the different transitions currently present. More transitions can be added,edited or removed.![Transitions](https://i.ibb.co/N2X4ZyF/gnome-shell-screenshot-BGB4-Z0.png)

Complete control over transitions like which roles are given permission and whether this transition is allowed for creator of the circuit. (When the reviewer creates a circuit, he cannot change the state from Review to Published because allowed for creator is false.)![Transition Edit](https://i.ibb.co/3WPcNNY/gnome-shell-screenshot-GI7-PZ0.png)

Admin has an access to see when and what states where changed of which circuits and by whom.![Transition History](https://i.ibb.co/KWtB0Xd/gnome-shell-screenshot-UVFYZ0.png)

The admin can view the state and transition history for that circuit in the django-admin panel.![Individual Transition History](https://i.ibb.co/njywKN7/gnome-shell-screenshot-XXPZZ0.png)

Updated Dashboard sidebar to show logged-in user roles and my Publications tab.![Dashboard](https://i.ibb.co/Mf9WpNf/gnome-shell-screenshot-R4-D7-Z0.png)


## Demo Video:
[Click here](https://youtu.be/UdPZktMdv4s)

## Future Roadmap:
 - Full Integration of Front-end.
 - Ability to add multiple workflows.
 - Making use of Publication model from Publish API.
 - Converting circuit from save API to publish API.

 
 


