/* eslint-disable node/no-unsupported-features/es-syntax */
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'Enter a valid email']
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minLength: 6,
      select: false
    },
    confirmPassword: {
      type: String,

      minLength: 6,
      select: false,
      validate: {
        validator: function(value) {
          return value === this.password;
        },
        message: 'Confirm password must be the same as password'
      }
    },
    passwordLastUpdateAt: Date,
    passwordUpdateToken: String,
    passwordUpdateTokenExpiresAt: Date
  },
  { timestamps: true }
);
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function(jwtAt) {
  if (this.passwordLastUpdateAt) {
    // console.log(this.passwordLastUpdateAt.getTime() / 1000);
    // console.log(jwtAt);
    return jwtAt < this.passwordLastUpdateAt.getTime() / 1000;
  }
  return false;
};

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
