import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, Space } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../redux/authSlice";
import { ROUTES } from "../constants/routes.constants";
import styles from "./DashboardLayout.module.css";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const menuItems = [
    {
      key: ROUTES.USER_DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/user/profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
    {
      key: "/user/documents",
      icon: <FileTextOutlined />,
      label: "Documents",
    },
    {
      key: "/user/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <Layout className={styles.root}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        className={styles.sider}
      >
        <div className={styles.logo}>
          <div className={styles.logoMark}>M</div>
          {!collapsed && <span className={styles.logoText}>My Portal</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <Space size="middle" className={styles.headerRight}>
            <button className={styles.iconBtn}>
              <BellOutlined />
            </button>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              arrow
            >
              <Space className={styles.userInfo} style={{ cursor: "pointer" }}>
                <Avatar size={36} style={{ backgroundColor: "var(--sage-primary)" }}>
                  {user?.name?.[0] || "U"}
                </Avatar>
                <div className={styles.userMeta}>
                  <Text strong className={styles.userName}>
                    {user?.name || "User"}
                  </Text>
                  <Text className={styles.userRole}>Member</Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
