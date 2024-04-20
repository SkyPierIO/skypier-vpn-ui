import http from "../http.common";
import NodeData from "../types/node.type"


class NodeDataService {
  getNickname() {
    console.log(http.get<NodeData>(`/nickname`))
    return http.get<NodeData>(`/nickname`);
  }

//   get(id: string) {
//     return http.get<string>(`/peer/${id}`);
//   }

// getAll() {
//   return http.get<Array<NodeData>("/tutorials");
// }

// get(id: string) {
//   return http.get<NodeData>(`/tutorials/${id}`);
// }

// create(data: NodeData) {
//   return http.post<NodeData>("/tutorials", data);
// }

// update(data: NodeData, id: any) {
//   return http.put<any>(`/tutorials/${id}`, data);
// }

// delete(id: any) {
//   return http.delete<any>(`/tutorials/${id}`);
// }

// deleteAll() {
//   return http.delete<any>(`/tutorials`);
// }

// findByTitle(title: string) {
//   return http.get<Array<NodeData>>(`/tutorials?title=${title}`);
// }

}

export default new NodeDataService();