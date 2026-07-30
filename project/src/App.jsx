import React from "react";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import store from "./redux/store";
import antdTheme from "./theme/antdTheme";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <AppRouter />
      </ConfigProvider>
    </Provider>
  );
};

export default App;
