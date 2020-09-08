import React, { useState } from "react"
import {
  Header,
  Label,
  Loader,
  Image,
  Table,
  Dropdown,
  Input,
} from "semantic-ui-react"
import { useAuth0 } from "@auth0/auth0-react"
import {
  useAllPostsQuery,
  useFilterPostsLazyQuery
} from "./types/operations"
import { useCategories } from "./categories"
import { Link } from "react-router-dom"
import { avatar } from "./avatar"

export function PostFeed() {
  const { user } = useAuth0()

  const { data, loading, error } = useAllPostsQuery()
  const [getFilteredPosts, { loading: filterLoading, data: filteredData, error: filterError }] = useFilterPostsLazyQuery()

  const {
    allCategories,
    allWriteableCategories,
    loading: catLoading,
    error: catError,
  } = useCategories(user?.email ?? "")
  
  const [searchText, setSearchText] = useState("")

  const tagsOptions: Array<{key: string, text: string, value: string}> = []

  if (loading || catLoading || filterLoading) return <Loader />
  if (error) return `Error! ${error.message}`
  if (catError) return `Error! ${catError.message}`
  if (filterError) return `Error! ${filterError.message}`

  const categoriesOptions = allCategories.map((category) => {
    return { key: category?.id, text: category?.name, value: category?.id }
  })

  const searchPosts = () => {

    getFilteredPosts({variables:{filter:{}}})
  }

  const textSearch = (e: any) => {
    setSearchText(e.target.value)
    console.log("Ss")
    searchPosts()
  }

  const items = data?.queryPost?.map((post) => {
    const likes = post?.likes ?? 0
    const tagsArray = post?.tags?.split(",") || []
   tagsArray.forEach((tag) => {
     if (tagsOptions.findIndex((x) => x["key"] === tag) === -1) {
       tagsOptions.push({ key: tag, text: tag, value: tag });
     }
    })

    return (
      <Table.Row key={post?.id}>
        <Table.Cell>
          <Link
            to={{
              pathname: "/post/" + post?.id,
              state: {
                categoriesOptions: categoriesOptions,
                tagsOptions: tagsOptions,
              },
            }}
          >
            {/* <a href={"/post/" + post?.id} style={{ color: "black" }}> */}
            <Header as="h4" image>
              <Image src={avatar(post?.author.avatarImg)} rounded size="mini" />
              <Header.Content>
                {post?.title}
                <Header.Subheader>{post?.author.displayName}</Header.Subheader>
              </Header.Content>
            </Header>
            {/* </a> */}
          </Link>
        </Table.Cell>
        <Table.Cell>
          <span className="ui red empty mini circular label"></span>{" "}
          {" " + post?.category.name}
        </Table.Cell>
        <Table.Cell>
          {tagsArray.map((tag) => {
            return (
              <Label as="a" basic color="grey" key={tag}>
                {tag}
              </Label>
            )
          })}
        </Table.Cell>
        <Table.Cell>
          <p>
            <i className="heart outline icon"></i> {likes} Like
            {likes === 1 ? "" : "s"}
          </p>
          <p>
            {" "}
            <i className="comment outline icon"></i> {post?.comments.length} Replies
          </p>
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <>
      <div style={{ display: "flex", marginBottom: "2rem" }}>
        <Input
          icon="search"
          placeholder="Type any keywords..."
          style={{ marginRight: "10px", backgroundColor: "#f3f3f3" }}
          onChange={(e) => textSearch(e)}
        />
        <Dropdown
          placeholder="Categories"
          fluid
          search
          selection
          options={categoriesOptions}
          style={{
            marginRight: "10px",
            width: "20%",
            backgroundColor: "#f3f3f3",
          }}
        />
        <Dropdown
          placeholder="Tags"
          fluid
          multiple
          search
          selection
          options={tagsOptions}
          style={{
            marginRight: "10px",
            width: "41%",
            backgroundColor: "#f3f3f3",
          }}
        />
      </div>
      <Table basic="very" collapsing style={{ width: "100%" }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Posts</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Tags</Table.HeaderCell>
            <Table.HeaderCell>Responses</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{items}</Table.Body>
      </Table>
    </>
  )
}
