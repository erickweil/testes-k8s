# https://www.baeldung.com/linux/use-command-line-arguments-in-bash-script
while getopts u:g:d:k: flag
do
    case "${flag}" in
        u) user=${OPTARG};;
        g) group=${OPTARG};;
        d) homedir=${OPTARG};;
        k) key=${OPTARG};;
    esac
done
# Create a user “sshuser” and group “sshgroup”
groupadd $group && useradd -ms /bin/bash -d $homedir/$user -g $group $user
# Create sshuser directory in home
mkdir -p $homedir/$user/.ssh
# Copy the ssh public key in the authorized_keys file. The idkey.pub below is a public key file you get from ssh-keygen. They are under ~/.ssh directory by default.
cp $key $homedir/$user/.ssh/authorized_keys
# change ownership of the key file. 
chown $user:$group $homedir/$user/.ssh/authorized_keys && chmod 600 $homedir/$user/.ssh/authorized_keys
