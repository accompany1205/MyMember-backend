const initState = {
    documentFolderList : [],
    documentSubFolderList : []
}

export const documentReducer = (state = initState, action) => {
     switch(action.type){
         case "Get_Document_List" : return {...state, documentFolderList : action.payload};
         case "GET_DOCUMENTS_LIST": return {...state, documentSubFolderList : action.payload};
         case "GET_DOCUMENTS_LOADING": return {...state, documentsLoading: action.payload}

         default: return state;
     }
}
