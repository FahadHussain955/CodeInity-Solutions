import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Badge } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../redux/authSlice";
import { ROUTES } from "../constants/routes.constants";
import styles from "./DashboardLayout.module.css";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const SuperAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const menuItems = [
    {
      key: ROUTES.SUPER_ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/super-admin/tenants",
      icon: <ApartmentOutlined />,
      label: "Tenants",
    },
    {
      key: "/super-admin/users",
      icon: <TeamOutlined />,
      label: "All Users",
    },
    {
      key: "/super-admin/permissions",
      icon: <SafetyCertificateOutlined />,
      label: "Permissions",
    },
    {
      key: "/super-admin/global",
      icon: <GlobalOutlined />,
      label: "Global Config",
    },
    {
      key: "/super-admin/settings",
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
      navigate(ROUTES.SUPER_ADMIN_LOGIN);
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
          <div className={styles.logoMark} style={{ background: "linear-gradient(135deg, #4A6741, #2C3825)" }}>
            S
          </div>
          {!collapsed && <span className={styles.logoText}>Super Admin</span>}
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
            <Badge count={3} size="small">
              <button className={styles.iconBtn}>
                <BellOutlined />
              </button>
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              arrow
            >
              <Space className={styles.userInfo} style={{ cursor: "pointer" }}>
                <Avatar size={36} style={{ backgroundColor: "#4A6741" }}>
                  {user?.name?.[0] || "S"}
                </Avatar>
                <div className={styles.userMeta}>
                  <Text strong className={styles.userName}>
                    {user?.name || "Super Admin"}
                  </Text>
                  <Text className={styles.userRole}>Super Administrator</Text>
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

export default SuperAdminLayout;
