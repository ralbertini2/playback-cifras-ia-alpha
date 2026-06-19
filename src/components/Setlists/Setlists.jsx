import { Check, ChevronDown, ListMusic, Music, Plus, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible.jsx';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../ui/sidebar.jsx';
import styles from './Setlists.module.css';

export default function Setlists({
  playlists = {},
  selectedPlaylist,
  setSelectedPlaylist,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
}) {
  const names = Object.keys(playlists).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selectedCount = selectedPlaylist ? playlists[selectedPlaylist]?.length || 0 : 0;

  return (
    <section className={styles.setlists} aria-label="Repertórios">
      <Collapsible defaultOpen>
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton type="button" className={styles.trigger}>
                <ListMusic size={17} />
                <span>Repertórios</span>
                <small>{selectedPlaylist ? `${selectedCount}` : `${names.length}`}</small>
                <ChevronDown size={16} className={styles.chevron} />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className={styles.subMenu}>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    type="button"
                    isActive={!selectedPlaylist}
                    className={styles.subButton}
                    onClick={() => setSelectedPlaylist('')}
                  >
                    <span>Todos os repertórios</span>
                    {!selectedPlaylist ? <Check size={14} /> : null}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {names.map((name) => (
                  <SidebarMenuSubItem key={name}>
                    <SidebarMenuSubButton
                      type="button"
                      isActive={selectedPlaylist === name}
                      className={styles.subButton}
                      onClick={() => setSelectedPlaylist(name)}
                    >
                      <span>{name}</span>
                      <small>{playlists[name]?.length || 0}</small>
                      {selectedPlaylist === name ? <Check size={14} /> : null}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>

              <div className={styles.actions}>
                <button onClick={onCreatePlaylist} type="button"><Plus size={15} /> Criar</button>
                <button onClick={onAddToPlaylist} type="button"><Music size={15} /> Adicionar</button>
                <button onClick={onDeletePlaylist} type="button"><Trash2 size={15} /> Excluir</button>
              </div>
            </CollapsibleContent>
          </SidebarMenuItem>
        </SidebarMenu>
      </Collapsible>
    </section>
  );
}
