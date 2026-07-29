import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { ROUTES } from "../../constants/routes.constants";

const { Title, Text } = Typography;

const UnauthorizedPage = () => {
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
      <div style={{ fontSize: 80, fontWeight: 800, color: "#C0574B44", lineHeight: 1 }}>
        403
      </div>
      <Title level={3} style={{ color: "var(--text-primary)", margin: 0 }}>
        Access Denied
      </Title>
      <Text style={{ color: "var(--text-muted)", maxWidth: 340, display: "block" }}>
        You don't have permission to view this page. Contact your administrator if this is a mistake.
      </Text>
      <Button type="primary" size="large" onClick={() => navigate(-1)} id="btn-back-403" style={{ marginTop: 12 }}>
        Go Back
      </Button>
      <Button type="text" onClick={() => navigate(ROUTES.LOGIN)} id="btn-home-403" style={{ color: "var(--text-muted)" }}>
        Return to Home
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
