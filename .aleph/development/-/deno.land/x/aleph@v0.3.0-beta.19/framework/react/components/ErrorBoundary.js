// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/components/ErrorBoundary.ts
import { Component, createElement } from "../../../../../../esm.sh/react@17.0.2.js";
import { inDeno } from "../helper.js";
var ErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    if (!inDeno) {
      Object.assign(window, { __ALEPH_ErrorBoundary: this });
    }
  }
  componentDidCatch(error, info) {
    this.setState({ error });
    if (error instanceof Promise) {
      error.then(() => this.setState({ error: null })).catch((error2) => this.setState({ error: error2 }));
      return;
    }
    const event = new CustomEvent("componentDidCatch", { detail: { error, info } });
    window.dispatchEvent(event);
  }
  render() {
    const { error } = this.state;
    if (error instanceof Promise) {
      return null;
    }
    if (error instanceof Error) {
      return createElement("pre", null, error.stack || error.message || error.toString());
    }
    return this.props.children;
  }
};
function E404Page() {
  return createElement(StatusError, {
    status: 404,
    message: "Page Not Found"
  });
}
function E400MissingComponent({ name }) {
  return createElement(StatusError, {
    status: 400,
    message: `Module '${name}' should export a React Component as default`,
    showRefreshButton: true
  });
}
var resetStyle = {
  padding: 0,
  margin: 0,
  lineHeight: 1.5,
  fontSize: 15,
  fontWeight: 400,
  color: "#333"
};
function StatusError({ status, message }) {
  return createElement("div", {
    style: {
      ...resetStyle,
      position: "fixed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      width: "100vw",
      height: "100vh"
    }
  }, createElement("p", {
    style: {
      ...resetStyle,
      fontWeight: 500
    }
  }, createElement("code", {
    style: {
      ...resetStyle,
      fontWeight: 700
    }
  }, status), createElement("small", {
    style: {
      ...resetStyle,
      fontSize: 14,
      color: "#999"
    }
  }, " - "), createElement("span", null, message)));
}
export {
  E400MissingComponent,
  E404Page,
  ErrorBoundary,
  StatusError
};
