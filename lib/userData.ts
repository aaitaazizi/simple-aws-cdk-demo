export const getUserData = () => {
    return `#!/bin/bash
yum -y install httpd
cat >> /var/www/html/index.html << 'EOF'
<h1>Welcome to AllDayDevOps 2020</h1>
<p><img src="https://3s1scc2ywmvgoa139sc9r819-wpengine.netdna-ssl.com/wp-content/uploads/2020/09/ADDO-Medium.png" /></p>
EOF
service httpd start`
}