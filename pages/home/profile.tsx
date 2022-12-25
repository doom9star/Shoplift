import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import Back from "../../lib/components/Back";
import { PrivateRoute } from "../../lib/components/Route";
import { cAxios } from "../../lib/constants";
import { useGCtx } from "../../lib/context";
import { TImageState, TServerResponse } from "../../lib/types";
import { getDataURI } from "../../lib/utils";

function Profile() {
  const { user, setUser } = useGCtx();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setLoading(true);
      const avatar = await getDataURI(e.target.files![0]);
      cAxios
        .put<TServerResponse>("/avatar", {
          avatar,
          avatarState: TImageState.CHANGE,
        })
        .then((res) => {
          setUser((prev) => ({ ...prev!, avatar: res.data.data }));
          setLoading(false);
        });
    },
    [setUser]
  );

  const handleAvatarRemove = useCallback(() => {
    setLoading(true);
    cAxios
      .put<TServerResponse>("/avatar", { avatarState: TImageState.REMOVE })
      .then((res) => {
        setUser((prev) => ({ ...prev!, avatar: res.data.data }));
        setLoading(false);
      });
  }, [setUser]);

  const avatar = useMemo(() => {
    return user?.avatar ? user.avatar.url : "/images/noAvatar.jpg";
  }, [user]);

  return (
    <PrivateRoute>
      <div className="h-full">
        <input
          type="file"
          hidden
          ref={inputRef}
          onChange={handleAvatarChange}
        />
        <div className="w-[80%] h-[90%] flex flex-col justify-center items-center mx-auto overflow-y-scroll no-scrollBar my-4 px-2 py-4 pb-20">
          <Back style="self-end my-10" />
          <div className="border p-1 rounded-full w-52 h-52 relative">
            <img
              src={avatar}
              alt={avatar}
              className="rounded-full w-full h-full"
            />
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-500 top-0 border-b-0 rounded-full animate-spin absolute" />
            ) : (
              <i
                className="fas fa-pen absolute top-0 text-gray-600 cursor-pointer"
                onClick={() => setShowMenu(!showMenu)}
              />
            )}
            {showMenu && (
              <div
                className="bg-gray-100 shadow-md absolute top-7 -left-32 w-[150px] px-2 py-4 text-sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <p
                  className="px-4 py-2 font-bold text-gray-600 z-50 cursor-pointer hover:bg-white select-none"
                  onClick={() => inputRef.current?.click()}
                >
                  <i className="fas fa-address-book mr-2" /> Change
                </p>
                {user?.avatar && (
                  <p
                    className="px-4 py-2 font-bold text-gray-600 z-50 cursor-pointer hover:bg-white select-none"
                    onClick={handleAvatarRemove}
                  >
                    <i className="fas fa-trash-alt mr-2" /> Remove
                  </p>
                )}
              </div>
            )}
          </div>
          <span className="text-gray-600 text-4xl">
            <b className="text-gray-400">@</b>
            {user?.name}
          </span>
        </div>
      </div>
    </PrivateRoute>
  );
}

export default Profile;
