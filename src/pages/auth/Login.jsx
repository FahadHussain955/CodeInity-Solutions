import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Space, Divider } from "antd";
import { ROUTES } from "../../constants/routes.constants";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Title level={3} style={{ textAlign: "center", margin: 0, color: "var(--text-primary)" }}>
        Welcome Back
      </Title>
      <Text style={{ textAlign: "center", color: "var(--text-muted)", display: "block", marginBottom: 16 }}>
        Choose how you'd like to continue
      </Text>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Button
          type="primary"
          size="large"
          block
          id="btn-go-signin"
          onClick={() => navigate(ROUTES.SIGNIN)}
        >
          Sign In
        </Button>
        <Button
          size="large"
          block
          id="btn-go-signup"
          onClick={() => navigate(ROUTES.SIGNUP)}
        >
          Create an Account
        </Button>
      </Space>

      <Divider style={{ borderColor: "var(--divider-color)", margin: "16px 0" }} />

      <Text style={{ textAlign: "center", fontSize: "var(--font-sm)", color: "var(--text-muted)", display: "block" }}>
        Forgot your password?{" "}
        <span
          onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
          style={{ color: "var(--sage-primary)", fontWeight: 600, cursor: "pointer" }}
          id="link-forgot-password"
        >
          Reset it
        </span>
      </Text>
      <Text style={{ textAlign: "center", fontSize: "var(--font-sm)", color: "var(--text-muted)", display: "block" }}>
        <span
          onClick={() => navigate(ROUTES.SUPER_ADMIN_LOGIN)}
          style={{ color: "var(--text-muted)", cursor: "pointer" }}
          id="link-superadmin"
        >
          Super Admin Access →
        </span>
      </Text>
    </div>
  );
};

export default Login;
