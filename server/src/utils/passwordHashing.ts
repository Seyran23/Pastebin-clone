import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const hashingPassword = async (text: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(text, salt);
};

export default hashingPassword;
