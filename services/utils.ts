import { supabase } from "@/utils/supabase"

const getUserData = async () => {
    const auth_id = (await supabase.auth.getUser()).data.user?.id;

    // get user from userDatabase
    const userData = await supabase.from('user').select().eq("user_auth_id",auth_id);

    return userData
}

export {
    getUserData
}