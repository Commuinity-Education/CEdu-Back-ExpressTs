import * as bcrypt from "bcrypt";

export class Hash {
    public hashPasword(password: string): Promise<string> {
        if (password)
            return bcrypt.hash(password, 9)
        return Promise.resolve(password)
    }

    public verifyPassword(password: string, encryptedPassword: string): boolean {
        if (!password) return false
        return bcrypt.compareSync(password, encryptedPassword)
    }
}
