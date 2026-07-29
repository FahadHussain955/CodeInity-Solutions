import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "antd";
import { UserOutlined, ShopOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants/routes.constants";

const { Title, Text } = Typography;

const SignUpSelect = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title
        level={3}
        style={{ textAlign: "center", margin: 0, color: "var(--text-primary)" }}
      >
        Create an Account
      </Title>
      <Text
        style={{
          textAlign: "center",
          color: "var(--text-muted)",
          display: "block",
          marginBottom: 32,
          marginTop: 6,
        }}
      >
        Choose the type of account you want to register
      </Text>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button
          id="btn-signup-user"
          onClick={() => navigate(ROUTES.SIGNUP_USER)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 24px",
            background: "var(--cream-base)",
            border: "2px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "left",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--sage-primary)";
            e.currentTarget.style.background = "var(--sage-surface)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.background = "var(--cream-base)";
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--sage-primary), var(--sage-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--font-md)", color: "var(--text-primary)", marginBottom: 2 }}>
              User
            </div>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
              Browse products, place orders and manage your account
            </div>
          </div>
        </button>

        <button
          id="btn-signup-seller"
          onClick={() => navigate(ROUTES.SIGNUP_SELLER)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 24px",
            background: "var(--cream-base)",
            border: "2px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "left",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--sage-primary)";
            e.currentTarget.style.background = "var(--sage-surface)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.background = "var(--cream-base)";
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #C9A84C, #A07A30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShopOutlined style={{ color: "white", fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--font-md)", color: "var(--text-primary)", marginBottom: 2 }}>
              Seller
            </div>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
              List products, manage your store and grow your business
            </div>
          </div>
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Text style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <span
            id="link-goto-signin"
            onClick={() => navigate(ROUTES.SIGNIN)}
            style={{ color: "var(--sage-primary)", fontWeight: 600, cursor: "pointer" }}
          >
            Sign In
          </span>
        </Text>
      </div>
    </div>
  );
};

export default SignUpSelect;
