export type Profile = {
    id: string;
    handle: string;
    display_name: string | null;
    bio: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
};