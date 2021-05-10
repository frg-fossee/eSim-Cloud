import * as actions from "./actions";
import queryString from "query-string";
import api from "../../utils/Api";
import GallerySchSample from "../../utils/GallerySchSample";
import { renderGalleryXML } from "../../components/SchematicEditor/Helper/ToolbarTools";
import { setTitle } from "./index";
import randomstring from "randomstring";

export const setSchTitle = (title) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_TITLE,
    payload: {
      title: title,
    },
  });
};

export const setSchDescription = (description) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_DESCRIPTION,
    payload: {
      description: description,
    },
  });
};

export const setSchXmlData = (xmlData) => (dispatch) => {
  dispatch({
    type: actions.SET_SCH_XML_DATA,
    payload: {
      xmlData: xmlData,
    },
  });
};

// Api call to save new schematic or updating saved schematic.
export const saveSchematic = (title, description, xml, base64,newBranch=false) => (
  dispatch,
  getState
) => {
  var body = {
    data_dump: xml,
    base64_image: base64,
    name: title,
    description: description,
  };
  // Get token from localstorage
  const token = getState().authReducer.token;
  const schSave = getState().saveSchematicReducer;

  // add headers
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  if(!newBranch) {
    body.version = randomstring.generate({
      length: 20,
    });
    if (schSave.isSaved) {
      //  Updating saved schemaic
      body.save_id = schSave.details.save_id;
      body.branch=schSave.details.branch
      api
      .post("save", queryString.stringify(body), config)
      .then((res) => {
        dispatch({
          type: actions.SET_SCH_SAVED,
          payload: res.data,
        });
      })
      .catch((err) => {
        console.error(err);
      });
    } else {
      body.branch = randomstring.generate({
        length: 20,
      })
      // saving new schematic
      api
      .post("save", queryString.stringify(body), config)
      .then((res) => {
        dispatch({
          type: actions.SET_SCH_SAVED,
          payload: res.data,
        });
      })
      .catch((err) => {
        console.error(err);
      });
    }
  }
  else {
    body.branch = randomstring.generate({
      length: 20,
    })
    body.version = schSave.details.version
    console.log(body)
    // saving new schematic
    api
    .post("save", queryString.stringify(body), config)
    .then((res) => {
      dispatch({
        type: actions.SET_SCH_SAVED,
        payload: res.data,
      });
    })
    .catch((err) => {
      console.error(err);
    })
  }
};

// Action for Loading on-cloud saved schematics
export const fetchSchematic = (saveId, version,branch) => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token;

  // add headers
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  // console.log('Already Saved')
  api
    .get("save/" + saveId + "/" + version + "/" + branch, config)
    .then((res) => {
      dispatch({
        type: actions.SET_SCH_SAVED,
        payload: res.data,
      });
      dispatch(setSchTitle(res.data.name));
      dispatch(setSchDescription(res.data.description));
      dispatch(setSchXmlData(res.data.data_dump));
      renderGalleryXML(res.data.data_dump);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const setSchShared = (share) => (dispatch, getState) => {
  // Get token from localstorage
  const token = getState().authReducer.token;
  const schSave = getState().saveSchematicReducer;

  // add headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If token available add to headers
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  var isShared;
  if (share === true) {
    isShared = "on";
  } else {
    isShared = "off";
  }

  api
    .post(
      "save/" + schSave.details.save_id + "/sharing/" + isShared+"/"+schSave.details.version,
      {},
      config
    )
    .then((res) => {
      dispatch({
        type: actions.SET_SCH_SHARED,
        payload: res.data,
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

// Action for Loading Gallery schematics
export const loadGallery = (Id) => (dispatch, getState) => {
  var data = GallerySchSample[Id];

  dispatch({
    type: actions.LOAD_GALLERY,
    payload: data,
  });
  dispatch(setTitle("* " + data.name));
  dispatch(setSchTitle(data.name));
  dispatch(setSchDescription(data.description));
  dispatch(setSchXmlData(data.data_dump));
  renderGalleryXML(data.data_dump);
};

// Action for Loading local exported schematics
export const openLocalSch = (obj) => (dispatch, getState) => {
  var data = obj;

  dispatch({ type: actions.CLEAR_DETAILS });
  dispatch(setTitle("* " + data.title));
  dispatch(setSchTitle(data.title));
  dispatch(setSchDescription(data.description));
  dispatch(setSchXmlData(data.data_dump));
  renderGalleryXML(data.data_dump);
};
