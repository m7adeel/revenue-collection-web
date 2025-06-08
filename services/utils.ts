import { supabase } from "@/utils/supabase"

const getUserData = async () => {
    const authUser = (await supabase.auth.getUser()).data.user;
    const auth_id = authUser?.id;

    // get user from userDatabase
    const userData = await supabase.from('user').select().eq("user_auth_id",auth_id).single();

    return {
        ...userData.data,
        email: authUser?.email
    }
}

export {
    getUserData
}