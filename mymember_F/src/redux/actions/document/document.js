import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;
export const Create_DocFolder = task => {
  return dispatch => {
    axios.post(
      `${baseUrl}/api/document_folder/create_folder/${localStorage.getItem("user_id")}`,
      {...task},
      {
        headers : {
          "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
      }}
    ).then(() => {
      dispatch(Get_DocFolder_LIST());
    })
  }
}

export const Get_DocFolder_LIST = () => {
  return async dispatch => {
    try{
      let response = await axios.get(
        `${baseUrl}/api/document_folder/read_folder/${localStorage.getItem("user_id")}`,
        {
          headers : {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );
      console.log('Subfolder response: ', response.data);
      if(response.data && response.status === 200 && !response.data.msg){
        dispatch({
          type : "Get_Document_List",
          payload : response.data,
        })
      }
      else{
        dispatch({
          type : "Get_Document_List",
          payload : []
        })
      }
    }
    catch(error){
      console.log(error);
      dispatch({
        type : "Get_Document_List",
        payload : []
      })
    }
  }
}
export const Create_DocSubFolder = (data, folderId) => {
  return async dispatch => {
    try {
      let response = await axios.post(
        `${baseUrl}/api/document_subfolder/create_subfolder/${localStorage.getItem("user_id")}/${folderId._id}`,
        data,
        {
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );
      if (response.data && response.status === 200) {
        console.log(response.data);
        dispatch(Get_DocFolder_LIST());
      }
    }
    catch (error) {
      console.log(error);
    }
  }
}

// Edit Folder API Call
export const EDIT_FOLDER = (data, folderId) => {
  return async dispatch => {
    try {
      let response = await axios.put(
        `${baseUrl}/api/document_subfolder/edit_folder/${localStorage.getItem("user_id")}/${folderId._id}`,
        data,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );
      if (response.data && response.status === 200) {
        console.log(response.data);
        dispatch(Get_DocFolder_LIST());
      }
    }
    catch (error) {
      console.log(error);
    }
  }
}

// Remove folder API Call
export const REMOVE_FOLDER = (data, folderId) => {
  return async dispatch => {
    try {
      let response = await axios.delete(
        `${baseUrl}/api/document_subfolder/edit_folder/${localStorage.getItem("user_id")}/${folderId._id}`
        ,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );
      if (response.data && response.status === 200) {
        console.log(response.data);
        dispatch(Get_DocFolder_LIST());
      }
    }
    catch (error) {
      console.log(error);
    }
  }
}

// List Documents API Call
export const LIST_DOCUMENTS = (folderId) => {
  return async dispatch => {
    try{
      let response = await axios.get(
        `${baseUrl}/api/document_subfolder/list_docuemnt/${localStorage.getItem("user_id")}/${folderId}`,
        {
          headers : {
            "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );
      console.log('List response: ', response.data);
      if(response.data && response.status === 200 && !response.data.msg){
        dispatch({
          type : "Get_Sub_Document_List",
          payload : response.data
        })
      }
      else{
        dispatch({
          type : "Get_Sub_Document_List",
          payload : []
        })
      }
    }
    catch(error){
      console.log(error);
      dispatch({
        type : "Get_Sub_Document_List",
        payload : []
      })
    }
  }
}

// Upload Document API Call
export const UPLOAD_DOCUMENT = (folderId, document, documentName) => {
  return async dispatch => {
    try{
      console.log("folderId: ", folderId);
      console.log("document: ", document);
      console.log("documentName: ", documentName);
      console.log("Auth: ", `Bearer ${localStorage.getItem("access_token")}`);
      let bodyFormData = new FormData();
      bodyFormData.append('document', document,documentName);
      bodyFormData.append('document_name', documentName);
      bodyFormData.append('subFolder', folderId);

      let response = await axios({
        method: 'post',
        url: `${baseUrl}/api/upload_document/${localStorage.getItem("user_id")}`,
        data: bodyFormData,
        headers: {
          "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
      });
      console.log('Upload response: ', response.data);
      if(response.data && response.status === 200 && !response.data.msg){
        dispatch({
          type : "Get_Sub_Document_List",
          payload : response.data
        })
      }
      else{
        dispatch({
          type : "Get_Sub_Document_List",
          payload : []
        })
      }
    }
    catch(error){
      console.log(error);
      dispatch({
        type : "Get_Sub_Document_List",
        payload : []
      })
    }
  }
}
