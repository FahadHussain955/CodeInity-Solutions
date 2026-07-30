import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { ROUTES } from "../constants/routes.constants";

const { Title, Text } = Typography;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--cream-base)",
      flexDirection: "column",
      gap: 12,
      textAlign: "center",
      padding: 24,
    }}>
      <div style={{ fontSize: 80, fontWeight: 800, color: "var(--sage-muted)", lineHeight: 1 }}>
        404
      </div>
      <Title level={3} style={{ color: "var(--text-primary)", margin: 0 }}>
        Page Not Found
      </Title>
      <Text style={{ color: "var(--text-muted)", maxWidth: 340, display: "block" }}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button type="primary" size="large" onClick={() => navigate(ROUTES.LOGIN)} id="btn-home-404" style={{ marginTop: 12 }}>
        Go Back Home
      </Button>
    </div>
  );
};

export default NotFound;
