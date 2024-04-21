import { Component, ChangeEvent } from "react";
import NodeDataService from "../services/node.service";
import NodeData from '../types/node.type';

type Props = {};

type State = {
  currentNode: NodeData;
  status: string;
}

export default class Node extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.getNickname = this.getNickname.bind(this);

    this.state = {
      currentNode: {
        nickname: "John Doe's Node"
      },
      status: "",
    };
  }

  getNickname() {
    NodeDataService.getNickname()
      .then((response: any) => {
        console.log("getNickname debug");
        console.log(response.data);
        this.setState({
          currentNode: response.data,
        });
        console.log(response.data);
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  render() {
    const { currentNode } = this.state;
    console.log(currentNode);

    return (
      <>
        Hello {currentNode.nickname}
      </>
    );
  }

}