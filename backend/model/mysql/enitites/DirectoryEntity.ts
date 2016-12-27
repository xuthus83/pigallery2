import {Table, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {PhotoEntity} from "./PhotoEntity";

@Table()
export class DirectoryEnitity implements DirectoryDTO {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 500
    })
    name: string;

    @Column({
        length: 500
    })
    path: string;


    @Column('datetime')
    public lastUpdate: Date;

    @ManyToOne(type => DirectoryEnitity, directory => directory.directories)
    public parent: DirectoryEnitity;

    @OneToMany(type => DirectoryEnitity, dir => dir.parent)
    public directories: Array<DirectoryEnitity>;

    @OneToMany(type => PhotoEntity, photo => photo.directory)
    public photos: Array<PhotoEntity>;

}