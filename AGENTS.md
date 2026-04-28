# Imports
Ao importar arquivos, siga o padrão this.load.image(...). IMPORTE NO BOOT.JS.
!!! IGNORE A PASTA ''IMAGES/HUD''.
Coloque o nome da pasta da qual o arquivo foi importado em frento ao arquivo e como um comentário acima dos imports desta pasta.
ex.:
arquivo: ../images/elements/bosque.png
nome do import: elementsBosque
Acima desta seção de imports de elements, escreva // ELEMENTS.

# Rejogabilidade
O jogo deve ser possível de ser rejogado, então reincialize animações e lógicas no topo da cena, para evitar bugs.