export const facebookConfig = {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/facebook/callback',
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'publish_video'
    ]
  };