const isOrgEmail = (email) => {
  const domain = email.split('@')[1]
  return domain === 'asyv.org'
}
