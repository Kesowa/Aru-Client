const config = {
  VITE_COG_URL: "http://titil-titil-P48AWVYCWDCC-1947846147.ap-south-1.elb.amazonaws.com",
  VITE_LIVE_URL: "http://localhost:8080",
  VITE_RTMP_URL: "rtmp://RtmpStreamingBalancer-7c6c94ac0db39cd0.elb.ap-south-1.amazonaws.com:1935/live",
  VITE_PUBLIC_URL: "http://www.kesowa.com.s3-website.ap-south-1.amazonaws.com",
  VITE_ENV: "development",
  VITE_TITILER_STATIC: "https://kesowa-static-data.s3.ap-south-1.amazonaws.com",
  VITE_INSTANCE: "aru",
  VITE_STATIC_URL: "https://d25g9bq6hvfa5.cloudfront.net",
  VITE_API_URL: "https://api-aws.kesowa.com",
};

window.config = config;
