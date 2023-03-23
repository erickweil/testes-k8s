#!/bin/bash
# https://www.baeldung.com/linux/use-command-line-arguments-in-bash-script
while getopts u:g:d:p: flag
do
    case "${flag}" in
        u) user=${OPTARG};;
        g) group=${OPTARG};;
        d) homedir=${OPTARG};;
#       k) key=${OPTARG};;
        p) password=${OPTARG};;
    esac
done

# Create a user “sshuser” and group “sshgroup”
# https://askubuntu.com/questions/94060/run-adduser-non-interactively
groupadd $group 
adduser --gecos "" --disabled-password --home $homedir/$user $user && echo "$user:$password" | chpasswd
usermod -a -G sudo $user
usermod -a -G $group $user

# https://stackoverflow.com/questions/59838/how-do-i-check-if-a-directory-exists-or-not-in-a-bash-shell-script
if [ ! -d "$homedir/$user/.ssh" ]; then
    # Copy all starting needed files
    cp -R $homedir/exemplo/. $homedir/$user/
    # Create sshuser directory in home
    mkdir -p $homedir/$user/.ssh
    # change ownership of the files  https://winaero.com/run-chmod-separately-for-files-and-directories/
    chown -R $user:$user $homedir/$user && chmod -R 644 $homedir/$user/ && find $homedir/$user/ -type d -print0 |xargs -0 chmod 755
    # Copy the ssh public key in the authorized_keys file. The idkey.pub below is a public key file you get from ssh-keygen. They are under ~/.ssh directory by default.
    #cp $key $homedir/$user/.ssh/authorized_keys
    # change ownership of the key file. 
    chmod 600 $homedir/$user/.ssh/authorized_keys
    chmod 744 $homedir/$user/.bashrc

    # Configuração git do usuário
    cd $homedir/$user/
    sudo -H -u $user bash -c '
    git config --global user.name $USER &&
    git config --global user.email $USER@local &&
    git config --global core.editor nano &&
    ssh-keygen -t ed25519 -q -f $HOME/.ssh/id_ed25519 -N ""'
else
    echo "Diretório do usário já existe, não irá sobrescrever nada..."
    chown -R $user:$user $homedir/$user
    cd $homedir/$user/
    sudo -H -u $user bash -c 'ls -alHs'
fi