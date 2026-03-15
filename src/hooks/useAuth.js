import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/api/axios";
import { AUTH } from "@/api/endpoints";
import { toast } from "sonner";

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout: clearAuth, user } = useAuthStore();

  const login = useCallback(
    async (email, password, redirectPath = null) => {
      try {
        const { data } = await api.post(AUTH.LOGIN, { email, password });
        setAuth(data.user, data.token.token, data.refreshToken.token);
        toast.success("Connexion réussie !");

        // Redirection
        if (redirectPath) {
          navigate(redirectPath);
        } else if (data.user.role === "RECRUTEUR") {
          navigate("/recruteur/dashboard");
        } else {
          navigate("/candidat/dashboard");
        }
        return data;
      } catch (error) {
        const message = error.response?.data?.message || "Erreur de connexion";
        //toast.error(message);
        throw error;
      }
    },
    [setAuth, navigate],
  );

  const registerCandidat = useCallback(
    async (formData) => {
      try {
        const { data } = await api.post(AUTH.REGISTER_CANDIDAT, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Inscription réussie ! Vérifiez votre email.");
        return data;
      } catch (error) {
        const message =
          error.response?.data?.message || "Erreur lors de l'inscription";
        toast.error(message);
        throw error;
      }
    },
    [navigate],
  );

  const registerRecruteur = useCallback(
    async (formData) => {
      try {
        const { data } = await api.post(AUTH.REGISTER_RECRUTEUR, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Inscription réussie ! Vérifiez votre email.");
        navigate("/login");
        return data;
      } catch (error) {
        const message =
          error.response?.data?.message || "Erreur lors de l'inscription";
        toast.error(message);
        throw error;
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      await api.post(AUTH.LOGOUT);
    } catch {
      throw new Error("Erreur lors de la déconnexion");
    } finally {
      clearAuth();
      toast.success("Déconnexion réussie");
    }
  }, [clearAuth]);

  const forgotPassword = useCallback(async (email) => {
    try {
      const { data } = await api.post(AUTH.FORGOT_PASSWORD, { email });
      toast.success("Email de réinitialisation envoyé !");
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la demande";
      toast.error(message);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(
    async (token, password, passwordConfirmation) => {
      try {
        const { data } = await api.post(AUTH.RESET_PASSWORD, {
          token,
          password,
          password_confirmation: passwordConfirmation,
        });
        toast.success("Mot de passe réinitialisé ! Connectez-vous.");
        navigate("/login");
        return data;
      } catch (error) {
        const message =
          error.response?.data?.message || "Erreur lors de la réinitialisation";
        toast.error(message);
        throw error;
      }
    },
    [navigate],
  );

  const verifyEmail = useCallback(async (token) => {
    try {
      const { data } = await api.get(`${AUTH.VERIFY_EMAIL}?token=${token}`);
      toast.success("Email vérifié avec succès !");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur de vérification";
      toast.error(message);
      throw error;
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword, newPasswordConfirmation) => {
      try {
        const { data } = await api.put(AUTH.CHANGE_PASSWORD, {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: newPasswordConfirmation,
        });
        toast.success("Mot de passe modifié avec succès !");
        return data;
      } catch (error) {
        const message =
          error.response?.data?.message || "Erreur lors du changement";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  return {
    user,
    login,
    registerCandidat,
    registerRecruteur,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
  };
}
