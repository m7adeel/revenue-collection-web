import { supabase } from "@/utils/supabase"
import { getUserData } from "./utils";

const getTodayCollections = async () => {
    // get total amount collected today
    const data = await supabase.from("payment").select("amount,created_at").eq("created_at", new Date().toISOString());
    const total = data.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    // get total amount collected yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dataYesterday = await supabase.from("payment").select("amount,created_at").eq("created_at", yesterday.toISOString());
    const totalYesterday = dataYesterday.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    // get change percentage
    const changePercentage = total > 0 ? ((total - totalYesterday) / totalYesterday) * 100 : 0;

    return {
        today: total,
        yesterday: totalYesterday,
        changePercentage: changePercentage
    };
}

const getNewPayers = async () => {
    // get total number of new payers today
    const data = await supabase.from("payer").select("id,created_at").eq("created_at", new Date().toISOString());
    const total = data.data?.length || 0;

    // get total number of new payers yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dataYesterday = await supabase.from("payer").select("id,created_at").eq("created_at", yesterday.toISOString());
    const totalYesterday = dataYesterday.data?.length || 0;

    // get change percentage
    const changePercentage = total > 0 ? ((total - totalYesterday) / totalYesterday) * 100 : 0;

    return {
        today: total,
        yesterday: totalYesterday,
        changePercentage: changePercentage
    };
}

const getpayersVisited = async () => {
    const data = await supabase.from("payment").select("payer_id,created_at")

    const getUniquePayers = (payers) => {
        const uniquePayers = new Set();
        payers?.forEach((item) => {
            if (item.payer_id) {
                uniquePayers.add(item.payer_id);
            }
        });
        return Array.from(uniquePayers);
    };

    const payersToday = data.data?.filter((item) => {
        const createdAt = new Date(item.created_at);
        const today = new Date();
        return createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear();
    });

    const payersYesterday = data.data?.filter((item) => {
        const createdAt = new Date(item.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return createdAt.getDate() === yesterday.getDate() &&
            createdAt.getMonth() === yesterday.getMonth() &&
            createdAt.getFullYear() === yesterday.getFullYear();
    });

    // Unique payers for today and yesterday
    const uniquePayersToday = getUniquePayers(payersToday);
    const uniquePayersYesterday = getUniquePayers(payersYesterday);
    return {
        today: uniquePayersToday.length,
        yesterday: uniquePayersYesterday.length,
        changePercentage: uniquePayersToday.length > 0 ?
            ((uniquePayersToday.length - uniquePayersYesterday.length) / uniquePayersYesterday.length) * 100 :
            0,
    };
}

const getRecentPayments = async () => {
    const payments = await supabase.from("payment").select().limit(10).order("created_at", { ascending: false });
    const payers = await supabase.from("payer").select("first_name,last_name,id");
    const payerMap = new Map(payers.data.map(p => [p.id, `${p.first_name} ${p.last_name}`]));


    const data = payments.data.map(payment => ({
        ...payment,
        payer_name: payerMap.get(payment.payer_id) || "Unknown Payer"
    }));

    return data || [];
}

const getRecentpayers = async () => {
    const payers = await supabase.from("payer").select().order("created_date_time", { ascending: false }).limit(5);
    return payers.data || [];
}

const createAdmin = async (email: string, password: string, userData: object) => {
    const signedUserData = await getUserData()

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const body = JSON.stringify({
        email: email,
        password: password,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        default_payment_method: userData.default_payment_method || '',
        current_user_id: signedUserData.id || '',
    });

    const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })
}

const addPayer = async (payer) => {


    const body = JSON.stringify({
        // current_user_id: (await supabase.auth.getUser()).data.user?.id || '',
        first_name: payer.first_name || '',
        last_name: payer.last_name || '',
        company_name: payer.company_name || '',
        tin: payer.tin || '',
        phone: payer.phone || '',
        email: payer.email || '',
        vendor: payer.vendor,
        property_owner: payer.property_owner,
        business_type: payer.business_type || '',
        notes: payer.notes || '',
    })

    const res = await fetch('/api/payer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })

    if (!res.ok) {
        throw new Error('Failed to create payer')
    }

    const data = await res.json()
    return data
}

const addPayment = async (payment) => {
    const body = JSON.stringify({
        payer_id: payment.payer_id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        location: payment.location,
        invoice: payment.invoice,
        status: payment.status,
        notes: payment.notes,
        type: payment.type,
        ref_no: payment.ref_no
    })

    const res = await fetch('/api/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })

    if (!res.ok) {
        throw new Error('Failed to create payment')
    }

    const data = await res.json()
    return data
}

interface InvoiceInput {
    payer: string;
    amount_due: number;
    due_date: string;
    notes?: string;
    status: string;
    ref_no: string;
}

const addInvoice = async (invoice: InvoiceInput) => {
    const userData = await getUserData();

    const body = JSON.stringify({
        payer: invoice.payer,
        amount_due: invoice.amount_due,
        due_date: invoice.due_date,
        notes: invoice.notes || '',
        status: invoice.status,
        ref_no: invoice.ref_no,
        created_by: userData.id,
        last_modified_date: new Date().toISOString(),
    })

    const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })

    if (!res.ok) {
        throw new Error('Failed to create invoice')
    }

    const data = await res.json()
    return data
}

interface PropertyInput {
    owner: string;
    property_ref_no: string;
    address: string;
    geo_location: string;
    assess_payment: string;
    payment_expiry_date: string;
    type: string;
    notes?: string;
    images?: string;
}

const addProperty = async (property: PropertyInput) => {
    const body = JSON.stringify({
        owner: property.owner,
        property_ref_no: property.property_ref_no,
        address: property.address,
        geo_location: property.geo_location,
        assess_payment: property.assess_payment,
        payment_expiry_date: property.payment_expiry_date,
        type: property.type,
        notes: property.notes || '',
        images: property.images || '',
        last_modified_date: new Date().toISOString()
    })

    const res = await fetch('/api/property', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })

    if (!res.ok) {
        throw new Error('Failed to create property')
    }

    const data = await res.json()
    return data
}

const updateUser = async (userData) => {
    

    
}

export {
    getTodayCollections,
    getNewPayers,
    getpayersVisited,
    getRecentPayments,
    getRecentpayers,
    createAdmin,
    addPayer,
    addPayment,
    addInvoice,
    addProperty,
    getUserData
}