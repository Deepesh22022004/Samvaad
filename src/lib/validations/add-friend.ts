import { z } from "zod"; //define schemas that are validating the user input

export const addFriendValidator = z.object({
    email: z.string().email() // validate the input mail by the user just like joi
})