import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SendHorizontal } from "lucide-react";
import { forgotPassword } from "../../apis/auth";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const schema = yup.object({
    email: yup
      .string()
      .email("ce format n'est pas valide")
      .required("Le champ est obligatoire")
      .matches(
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
        "Format de votre email non valide"
      ),
  });

  const defaultValues = {
    email: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const submit = async (values) => {
    console.log(values);
    const response = await forgotPassword(values);
    console.log(response);

    if (response.messageOk) {
      toast.success(response.messageOk);
      reset(defaultValues);
    } else {
      toast.error(response.message);
    }
  };
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded">
        <h1 className="text-2xl mb-4 text-red-500">Mot de passe oublié ?</h1>
        <form
          onSubmit={handleSubmit(submit)}
          className="flex flex-col gap-4 mb-6 mx-auto max-w-[400px]"
        >
          <div className="flex flex-col mb-2">
            <div className="relative">
              <input
                {...register("email")}
                type="email"
                id="email"
                placeholder="votre email ..."
                className="w-full border border-gray-300 rounded px-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 cursor-pointer"
              >
                <SendHorizontal />
              </button>
            </div>

            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
